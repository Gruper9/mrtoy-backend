
import fs from 'fs'
import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'
import { dbService } from '../../services/db.service.js'

import mongodb from 'mongodb'
const { ObjectId } = mongodb

export const toyService = {
    query,
    getById,
    remove,
    update,
    add
}

const toys = utilService.readJsonFile('data/toy.json')


async function query(filterBy = { txt: '', maxPrice: 99999 }) {
    try {
        const criteria = {
            name: { $regex: filterBy.txt, $options: 'i' },
            price: { $lt: filterBy.maxPrice }
        }
        const collection = await dbService.getCollection('toyDB')
        var toys = await collection.find(criteria).toArray()
        return toys
    } catch (err) {
        loggerService.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toyDB')
        const toy = await collection.findOne({ _id: new ObjectId(toyId) })
        return toy
    } catch (err) {
        loggerService.error(`while finding toy ${toyId}`, err)
        throw err
    }
}
async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toyDB')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        loggerService.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}
async function add(toy) {
    try {
        const collection = await dbService.getCollection('toyDB')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price
        }
        const collection = await dbService.getCollection('toyDB')
        await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        loggerService.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

// function save(toy) {
//     if (toy._id) {
//         const toyToUpdate = toys.find(currToy => currToy._id === toy._id)

//         toyToUpdate.vendor = toy.name
//         toyToUpdate.price = toy.price
//         toy = toyToUpdate
//     } else {
//         toy._id = utilService.makeId()
//         toys.push(toy)
//     }

//     return _saveToysToFile().then(() => toy)
// }


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
