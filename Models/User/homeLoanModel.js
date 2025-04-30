const mongoose = require('mongoose');

const homeLoanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    occupation: {
        type: String,
        enum: ['Salaried', 'Self Employed', 'Other'],
        required: true
    },
    typeOfLoan: {
        type: String,
        enum: ['Home Loan', 'Plot Loan', 'Renovation Loan'],
        required: true
    },
    monthlySalary: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HomeLoan', homeLoanSchema);
