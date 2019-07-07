const express = require('express')
const Thread = require('../models/thread')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/threads', auth, async (req, res) => {
    const thread = new Thread({
        ...req.body,
        owner: req.user._id
    })

    try {
        await thread.save()
        res.status(201).send(thread)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/threads', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'threads',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/threads/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const thread = await Thread.findOne({ _id, owner: req.user._id })

        if (!thread) {
            return res.status(404).send()
        }

        res.send(thread)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/threads/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const thread = await Thread.findOne({ _id: req.params.id, owner: req.user._id})

        if (!thread) {
            return res.status(404).send()
        }

        updates.forEach((update) => thread[update] = req.body[update])
        await thread.save()
        res.send(thread)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/threads/:id', auth, async (req, res) => {
    try {
        const thread = await Thread.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!thread) {
            res.status(404).send()
        }

        res.send(thread)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
