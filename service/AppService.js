const User = require("../models/UserModel");
const Note = require("../models/NoteModel");

const JqlQuery = require("../models/JqlQueryModel");
const JiraService = require("../service/JiraService");

const checkIds = require("../utils/checkIds");
const {Types} = require("mongoose");


class AppService {

    async setProject(uid, newProject) {
        try {
            return await User.findByIdAndUpdate(uid, {selectedProject: newProject}, {new: true, select: '-__v'})
        } catch (err) {
            console.error('Ошибка при выборе проекта для пользователя', err)
            throw err
        }
    }

    async createJqlQuery(uid, name, query, fields, headers) {
        try {
            const querySnap = await JiraService.checkJqlQuery(headers, uid, query, fields);
            if (querySnap.status !== 200) {
                throw new Error(querySnap.message);
            }

            const newQuery = new JqlQuery({ user: uid, name, query, fields, result: querySnap.data });
            return await newQuery.save();
        } catch (err) {
            console.error('Ошибка при создании JQL запроса', err);
            throw err;
        }
    }

    async deleteJqlQuery(uid, queryId) {
        try {
            const query = await JqlQuery.findOneAndDelete({ _id: queryId, user: uid });

            if (!query) {
                throw new Error("Запрос не найден или у вас нет доступа к этому запросу.");
            }

            return { message: "Запрос успешно удален." };
        } catch (err) {
            console.error('Ошибка при удалении JQL запроса', err);
            throw err;
        }
    }

    async getJqlQueries(uid, page = 1, limit = 25, headers) {
        try {
            let queries = await JqlQuery.find({ user: new Types.ObjectId(uid) })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit + 1)
                .select('-__v');

            const hasMore = queries.length > limit;
            if (hasMore) {
                queries.pop();
            }

            queries = await Promise.all(queries.map(query => this.updateJqlQueryResult(query, headers)));

            return {
                queries,
                hasMore
            };
        } catch (err) {
            console.error('Ошибка при получении JQL запросов', err);
            throw err;
        }
    }

    async getJqlQueryById(uid, queryId, headers) {
        const invalidIds = checkIds(uid, queryId);
        if (invalidIds) return invalidIds;

        try {
            let query = await JqlQuery.findOne({ _id: queryId, user: new Types.ObjectId(uid) }).select('-__v');

            if (!query) {
                throw new Error("Запрос не найден или у вас нет доступа к этому запросу.");
            }

            return await this.updateJqlQueryResult(query, headers);
        } catch (err) {
            console.error('Ошибка при получении JQL запроса', err);
            throw err;
        }
    }

    async updateJqlQueryResult(query, headers) {
        try {
            const querySnap = await JiraService.checkJqlQuery(headers, query.user, query.query, query.fields);
            if (querySnap.status === 200) {
                query.result = querySnap.data;
                await query.save();
            }
        } catch (err) {
            console.error(`Ошибка обновления запроса ${query._id}:`, err);
        }

        return query;
    }

    async createNote(uid, title, content) {
        try {
            let note = await Note.findOne({ user: new Types.ObjectId(uid) });

            if (note) {
                note.title = title;
                note.content = content;
                await note.save();
                return note;
            } else {
                const newNote = new Note({
                    user: uid,
                    title,
                    content
                });
                return await newNote.save();
            }
        } catch (err) {
            console.error('Ошибка при создании или обновлении заметки', err);
            throw err;
        }
    }

    async getNote(uid) {
        try {
            const note = await Note.findOne({ user: new Types.ObjectId(uid) });

            if (!note) {
                return null;
            }

            return note;
        } catch (err) {
            console.error('Ошибка при получении заметки', err);
            throw err;
        }
    }

}

module.exports = new AppService();