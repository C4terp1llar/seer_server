const User = require("../models/UserModel");
const JqlQuery = require("../models/JqlQueryModel");
const JiraService = require("../service/JiraService");
class AppService {

    async setProject(uid, newProject) {
        try {
            return await User.findByIdAndUpdate(uid, {selectedProject: newProject}, {new: true, select: '-__v'})
        } catch (err) {
            console.error('Ошибка при выборе проекта для пользователя', err)
            throw err
        }
    }

    async createJqlQuery(uid, name, query, headers) {
        try {
            const { status, message } = await JiraService.checkJqlQuery(headers, uid, query);
            if (status !== 200) {
                throw new Error(message);
            }

            const newQuery = new JqlQuery({ user: uid, name, query });
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

    async getJqlQueries(uid, page = 1, limit = 25) {
        try {
            const queries = await JqlQuery.aggregate([
                { $match: { user: uid } },
                { $skip: (page - 1) * limit },
                { $limit: limit + 1 },
                { $sort: {createdAt: -1} },
                { $project: { name: 1, query: 1, result: 1, createdAt: 1 } }
            ]);

            const hasMore = queries.length > limit;
            if (hasMore) {
                queries.pop();
            }

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