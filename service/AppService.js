const User = require("../models/UserModel");
const JqlQuery = require("../models/JqlQueryModel");
const JiraService = require("../service/JiraService");
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
                .lean();

            const hasMore = queries.length > limit;
            if (hasMore) {
                queries.pop();
            }

            await Promise.all(queries.map(async (query) => {
                try {
                    const querySnap = await JiraService.checkJqlQuery(headers, query.user, query.query, query.fields);
                    if (querySnap.status === 200) {
                        query.result = querySnap.data;
                        await JqlQuery.updateOne({ _id: query._id }, { $set: { result: querySnap.data } });
                    }
                } catch (err) {
                    console.error(`Ошибка обновления запроса ${query._id}:`, err);
                }
            }));

            return {
                queries,
                hasMore
            };
        } catch (err) {
            console.error('Ошибка при получении JQL запросов', err);
            throw err;
        }
    }

    async getJqlQueryById(uid, queryId) {
        try {
            const query = await JqlQuery.findOne({ _id: queryId, user: uid }).select('-__v').lean();

            if (!query) {
                throw new Error("Запрос не найден или у вас нет доступа к этому запросу.");
            }

            return query;
        } catch (err) {
            console.error('Ошибка при получении JQL запроса', err);
            throw err;
        }
    }



}

module.exports = new AppService();