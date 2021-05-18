const jwt_decode = require('jwt-decode');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const ANSWERS_PER_PAGE = 2;

exports.getQuestion = (req, res, next) => {

    let questionID = req.params.id;
    const page = +req.query.page || 1;

    let question, totalAnswers, answersArr;

    if (isNaN(questionID)) questionID = 1;

    let questionPromise = new Promise((resolve, reject) => { 
        models.Questions.findAll({ raw: true, where: { id: questionID } })
        .then(row => {
            
            if (row.length == 0) res.status(404).json({message: 'Question not found!'}); 

            let q = {};
            
            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };
            
            q.id = row[0].id;
            q.title = row[0].title;
            q.text = row[0].text;
            q.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(row[0].dateCreated);
            q.userId = row[0].UsersId;
            q.name = row[0].UsersName;
            q.surname = row[0].UsersSurname;
            q.keywords = row[0].keywords;

            question = q;
            resolve();

        })
        .catch(err => { return res.status(500).json({message: 'Internal server error.'}) });
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.count({ where: { QuestionsId: questionID }}).then(numAnswers => {
            totalAnswers = numAnswers;

            if(page > Math.ceil(totalAnswers / ANSWERS_PER_PAGE) && totalAnswers !== 0) return res.status(404).json({ message: 'This answer page does not exist.' })
            
            return models.Answers.findAll({
                offset: ((page - 1) * ANSWERS_PER_PAGE),
                limit: ANSWERS_PER_PAGE,
                raw: true,
                where: { QuestionsId: questionID },
                order: [['dateCreated', 'DESC']]
            });
        })        
        .then(answers => {

            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };

            answersArr = answers;
            answersArr.forEach(ans => ans.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(ans.dateCreated))
            resolve();
        })
        .catch(err => { return res.status(500).json({message: 'Internal server error.'}) });

    })
    Promise.all([questionPromise, answersPromise]).then(() => {

        return res.status(200).json({ 
            pagination: {
                currentPage: page,
                hasNextPage: ANSWERS_PER_PAGE * page < totalAnswers,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalAnswers / ANSWERS_PER_PAGE)
            },
            question: question,
            answers: answersArr,
            answersCounter: answersArr.length,
            totalAnswers: totalAnswers,
        })

    }).catch(err => { return res.status(500).json({message: 'Internal server error.'}) })

}

exports.postAnswer = (req, res, next) => {

    const questionID = req.params.id;
    const answerText = req.body.answer;
    
    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    models.Answers.create({
        text: answerText,
        dateCreated: Date.now(),
        UsersId: userData.user.id,
        UsersName: userData.user.name,
        UsersSurname: userData.user.surname,
        QuestionsId: questionID
    })
    .then(() => {
        return res.status(201).json({ message: 'Answer submitted successfully.' })
    })
    .catch(err => { return res.status(500).json({message: 'Internal server error.'}) })
}

exports.events = (req, res, next) => {

    console.log(req.body);

    res.status(200).json({});

}