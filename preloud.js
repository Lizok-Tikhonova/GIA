const { Client } = require('pg');
const {contextBridge} = require('electron')

async function connectClient(){
    const client = await new Client({
        user: 'postgres',
        password: '0000',
        host: 'localhost',
        port: 5432,
        database: 'gia',
    });

    await client.connect();
    return client
}

const getUsers = async () => {
    let client = await connectClient()
    let Users = await client.query('SELECT * FROM users');
    await client.end();
    return Users.rows
}

const auth = async (login, password) => {
    let client = await connectClient()
    let User = await client.query(`SELECT * FROM users where password='${password}' and login='${login}'`);
    await client.end();
    return User.rows
}

const registration = async (login, password, fio, pasport, phone, address, mail, birthday) => {
    let client = await connectClient()
    await client.query(`insert into users (login, password, fio, pasport, phone, address, mail, birthday, last_entry, id_role)
    values('${login}','${password}','${fio}','${pasport}','${phone}','${address}','${mail}','${birthday}',now(), 3);`)
    await client.end()
    return true
}

const addReq = async(name_equipment, defect_type, description, id_client) =>{
    let client = await connectClient()
    await client.query(`insert into requests(name_equipment, defect_type, description, id_client, status, work_status)
    values('${name_equipment}', '${defect_type}','${description}','${id_client}', '0', '0')`)
    await client.end()
    return true
}

const getReq = async() => {
    let client = await connectClient()
    let requests = await client.query(`select requests.id_request, requests.name_equipment, defects_types.name_defecte, requests.description, requests.id_client, requests.status, requests.work_status, requests.employer, defects_types.name_defecte from requests, defects_types where requests.defect_type = defects_types.id_defecte`)
    await client.end()
    return requests.rows
}

const getReqUser = async(id) => {
    let client = await connectClient()
    let requests = await client.query(`select requests.name_equipment, requests.description, requests.date_create, requests.status, requests.work_status, requests.employer, requests.finished_date, defects_types.name_defecte
     from requests, defects_types where defects_types.id_defecte = requests.defect_type and requests.id_client ='${id}'`)
    await client.end()
    // console.log(requests.rows);
    return requests.rows
}

const getTypes = async() =>{
    let client = await connectClient()
    let types = await client.query(`select * from defects_types`)
    await client.end()
    return types.rows
}

const statistica = async() => {
    let client = await connectClient()
    let countDevice = await client.query(`select name_defecte, count(id_defecte) from requests, defects_types where defects_types.id_defecte = requests.defect_type group by name_defecte`)
    let total = await client.query(`select count(id_defecte) from defects_types, requests where defects_types.id_defecte = requests.defect_type`)
    await client.end()
    return {countDevice: countDevice.rows, total: total.rows[0]}
}

const getMasters = async() =>{
    let client = await connectClient()
    let masters = await client.query(`select * from users where id_role='${2}'`)
    await client.end()
    return masters.rows
}

const confirmReq = async(id_request, employer) => {
    let client = await connectClient()
    await client.query(`update requests set employer='${employer}', status = '1', work_status= '1' where id_request = '${id_request}'`)
    await client.end()
    return true
}

const reqMaster = async(id) => {
    let client = await connectClient()
    let list = await client.query(`select requests.id_request, requests.name_equipment, requests.description, requests.date_create, requests.status, requests.work_status, requests.employer, defects_types.name_defecte
    from requests, defects_types where id_defecte = requests.defect_type and employer='${id}' and work_status = '1'`)
    await client.end()
    return list.rows
}


const finishedReq = async(id_request) => {
    let client = await connectClient()
    await client.query(`update requests set work_status = '2', finished_date = now() where id_request = '${id_request}'`)
    await client.end()
    return true
}


contextBridge.exposeInMainWorld('api', {
    getUsers,
    auth,
    registration,
    addReq,
    getReqUser,
    getTypes,
    getReq,
    getMasters,
    confirmReq,
    statistica,
    reqMaster,
    finishedReq
})