const express = require('express');
const mongoose = require ("mongoose");
const router = express.Router();
const todoSchema = require('../schemas/todoSchema');
const userSchema = require('../schemas/userSchema');
const Todo = new mongoose.model("Todo", todoSchema);
const User = new mongoose.model("User", userSchema);
const checkLogin = require("../middlewares/checkLogin");



//GET all the todos
router.get('/', checkLogin, (req, res) => {
    Todo.find({})
    .populate("user", "name username")
    .select({
        _id: 0,
        _v: 0,
        date: 0
    })
    .limit(2)
    .exec((err, data) => {
        if(err) {
            res.status(500).json({
                error: " there was a server side error!"
            });
        } else {
            res.status(200).json({
                result: data,
                message: "Todo was inserted successfully"
            });
        }
    });
});


//GET active todos
router.get("/active", async (req, res) => {
    const todo = new Todo();
    const data = await todo.findActive();
    res.status(200).json({
        data,
    });
});

//GET active todos with callback
router.get("/active-callback", (req, res) => {
    const todo = new Todo();
    todo.findActiveCallback((err, data) => {
        res.status(200).json({
            data,
        });
    });
});



//GET active todos /js
router.get("/js", async (req, res) => {
    const data = await Todo.findByJS();
    res.status(200).json({
        data,
    });
});

//GET Todos by language
router.get("/language", async (req, res) => {
    const data = await Todo.find().byLanguage("react");
    res.status(200).json({
        data,
    });
});

//GET a todo by id
router.get('/:id', async (req, res) => {
    try{
        const data = await Todo.find({_id: req.params.id});
        res.status(200).json({
            result: data,
            message: "success",
        });
    } catch (err) {
        res.status(500).json({
            error: "There was a server side error!"
        });
    }
});


//POST a todo by id
router.post('/', checkLogin, async (req, res) => {
    const newTodo = new Todo({
        ...req.body,
        user: req.userId
    });
    try {
    const todo = await newTodo.save();
    await User.updateOne({
        _id: req.userId
    }, {
        $push: {
            todos: todo._id
        }
    });
    res.status(200).json({
        message: "Todo was inserted successfully"
    });
    } catch(err) {
       console.log(err);
       res.status(500).json({
       error: " there was a server side error!"
    }); 
    }
});


//POST multiple todos
router.post('/all', (req, res) => {
    Todo.insertMany(req.body, (err) => {
        if(err){
            res.status(500).json({
                error: " there were a server side error!"
            });
        } else {
            res.status(200).json({
                message: "Todo were inserted successfully"
            })
        }
    })
});


//PUT a todo by id
router.put('/:id', (req, res) => {
    const result = Todo.findByIdAndUpdate(
        {_id: req.params.id}, 
        {
        $set: {
            status: 'inactive'
        },
        },
        {
            new : true,
            useFindAndModify: false,
        },
    (err) => {
        if (err) {
            res.status(500).json({
                error: " there was a server side error",
            });
        } else {
            res.status (200).json({
                message: "Todo was update successfully",
            });
        }
    }
    );
    console.log(result);
});


//Delete a todo by id
router.delete('/:id', (req, res) => {
    Todo.deleteOne({_id: req.params.id}, (err) => {
        if(err){
            res.status(500).json({
                error: "There was a server side error!"
            });
        } else {
            res.status(200).json({
                message: "todo was deleted successfully",
            });
        }
    });
})


module.exports = router;
