const mongoose = require('mongoose')
const _ = require('lodash')
const Company = mongoose.model('companies')
const schema = mongoose.Schema;

const projectSchema = new schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    created_on: {
        type: Date,
        default: new Date
    },
    updated_on: {
        type: Date,
        default: new Date
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
});

projectSchema.statics.addProject = function (data, user) {
    return new Promise((resolve, reject) => {
        Company.findOne({ _id: user.company })
            .then(companyRes => {
                console.log('companyRes: ', companyRes)
                const companyProject = companyRes.projects
                const filterProj = companyProject.filter(proj => proj.name === data.name)
                console.log('companyProject ', companyProject)
                if (_.isEmpty(filterProj)) {
                    const newProject = new this(data)
                    newProject.save()

                    Company.findOneAndUpdate(
                        { _id: companyRes._id },
                        { $push: { projects: newProject } },
                        { new: true },
                        function (err, item) { console.log("err", err) });

                    resolve(newProject)
                } else {
                    const errorMsg = new Error('Project name already been used')
                    reject(errorMsg)
                }
            })
            .catch(err => {
                const errorMsg = new Error('Unauthorizated access')
                reject(errorMsg)
            })
    })
}

projectSchema.statics.getProject = function (user) {
    return new Promise((resolve, reject) => {
        Company.findOne({ created_by: user })
            .then(response => {
                this.find({
                    company: response._id
                }, function (err, proj) {
                    resolve(proj)
                })
            })
    })
}

const projectModel = mongoose.model('projects', projectSchema);
module.exports = projectModel;