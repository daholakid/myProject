const path = require('path');

const Knex = require('knex');
const { Model } = require('objection');

const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.join(__dirname, '../', 'coursetrain.db'),
    }
});
Model.knex(knex);

class Answer extends Model {
    static get tableName() {
        return 'answers';
    }

    static get relationMappings() {
        return {
            questions: {
                relation: Model.HasManyRelation,
                modelClass: Answer,
                join: {
                    from: 'questions.id',
                    to: 'answers.questionId'
                }
            }
        }
    }
}
class Question extends Model {
    static get tableName() {
        return 'questions';
    }

    static get relationMappings() {
        return {
            answers: {
                relation: Model.HasManyRelation,
                modelClass: Answer,
                join: {
                    from: 'questions.id',
                    to: 'answers.questionId'
                }
            }
        };
    }
}
class Course extends Model {
    static get tableName() {
        return 'courses';
    }

    static get relationMappings() {
        return {}
    }
}
class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get relationMappings() {
        return {
            userCourses: {
                relation: Model.ManyToManyRelation,
                modelClass: Course,
                join: {
                    from: 'users.id',
                    through: {
                        from: 'users_courses.userId',
                        to: 'users_courses.courseId',
                        extra: ['status']
                    },
                    to: 'courses.id'
                }
            }
        }
    }
}

class Command {
    async getCourses(username) {
        const allCourses = await Course.query().select();

        const { userCourses } = (await User.query()
            .findOne({ username })
            .eager('userCourses')) || { userCourses: [] };

        userCourses.map((userCourse) => {
            const attemptedCourse = allCourses.find((course) => course.id === userCourse.id);
            attemptedCourse.status = userCourse.status;
        });

        return allCourses;
    }

    async getCourse(id) {
        console.log(id);
        const course = await Course
            .query()
            .findById(id)
            .first();

        return course;
    }

    async createUser(username, password) {
        const user = await User
            .query()
            .findOne({
                username,
                password,
            });


        if (user) return;

        return await User.query()
            .insert({
                username,
                password,
            });

    }

    async findPosition(pos) {
        const poslog = await User
            .query()
            .findOne({ pos });
        return poslog;
    }

    async findUser(username, password) {
        const userlog = await User
            .query()
            .findOne({ username, password });
        return userlog;
    }

    async getQuiz(courseId) {
        return await Question.query()
            .where('courseId', courseId)
            .eager('answers');
    }

    async getQuestion() {
        return await Question.query()
            .select('questions.*');
    }

    async getQuestionById(id) {
        return await Question
            .query()
            .findOne({
                id,
            });

    }

    async getAnswers(questionId) {
        return await Answer.query()
            .where('questionId', questionId)
    }

    async getAnswerById(id) {
        return await Answer
            .query()
            .findOne({
                id,
            });

    }

    async getAllCourses() {
        return await Course.query().select('courses.*');
    }

    async addCourse(name, descript, valid) {
        return await Course.query().insert({
            name,
            descript,
            valid,
        });
    }

    async addQuestion(content, category, courseid, type) {
        return Question
            .query()
            .insert({
                content,
                category,
                courseid,
                type,
            });
    }

    async addAnswer(content, questionid) {
        const datalog = await Answer
            .query()
            .insert({
                content,
                questionid
            });
        return datalog;
    }

    async deleteCourse(id) {
        const datalog = await Course
            .query()
            .deleteById(id);

    }

    async deleteQuestion(id) {
        console.log(id);
        const datalog = await Question
            .query()
            .delete()
            .where('id', '=', id);
    }

    async deleteAnswer(id) {
        const datalog = await Answer
            .query()
            .delete()
            .where('id', '=', id);
    }

    async getAnswers() {
        return Answer
            .query()
            .select('answers.*');
    }

    async addCorrectAnswer(questionid, correctid) {
        return Question
            .query()
            .findById(questionid)
            .patch({
                correctId: correctid,
            });
    }

    async editCourse(id, name, descript){
        return Course 
            .query()
            .findOne({
                id: id,
            })
            .patch({
                name: name,
                descript: descript,
            });
    }

    async editQuestion(id, content, courseId) {
        return Question
            .query()
            .findOne({
                id: id,
            })
            .patch({
                content: content,
                courseId: courseId,
            });
    }

    async editAnswer(id, content) {
        return Answer
            .query()
            .findOne({
                id: id,
            })
            .patch({
                content: content,
            });
    }

    async editStatus(id, status) {
        return Course
        .query()
        .findOne({
            id: id,
        })
        .patch({
            valid: status,
        });
    }

}

const command = new Command();

// export default command;
module.exports = command;