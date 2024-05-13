// async function users(){
//     const polz =  await window.api.getUsers()
//     polz.forEach(element => {
//         console.log(element);
//     });
// }
// users()

let role
let id

// для преобразования даты из базы
function normalDate(strintDate){
    let date = new Date(strintDate)
    return date.toLocaleDateString()
}

//авторизация
const btnAuth = document.querySelector('.btnAuth')
btnAuth.addEventListener('click', async()=>{
    let login = document.querySelector('.login').value
    let password = document.querySelector('.pass').value
    let user = await window.api.auth(login, password)
    if(!user || !password){
        newtDialog('заполните данные полностью')
    }
    if(user.length>0){
        role = user[0].id_role
        id = user[0].id_user

        if(role == 1){
            Admin()
        }
        else if(role == 2){
            Master()
        }
        else{
            User()
        }
        showProfile(user[0])
        addHide('auth')
        removeHide('exit')
    } else{
        newtDialog('Пользователь не найден')
    }
})


//выход
let exit = document.querySelector('.exit')
exit.onclick = () => {
    location.reload()
}

//регистрация
const btnReg = document.querySelector('.btnReg')
btnReg.addEventListener('click', async()=>{
    let login = document.querySelector('.loginr').value
    let password = document.querySelector('.passr').value
    let fio = document.querySelector('.fio').value
    let phone = document.querySelector('.phone').value
    let pasport = document.querySelector('.pasport').value
    let mail = document.querySelector('.mail').value
    let address = document.querySelector('.address').value
    let birthday = document.querySelector('.birthday').value

    if(!login || !password || !fio || !phone || !pasport || !mail){
        newtDialog("заполните данные полностью")
    }
    let statusReq = await window.api.registration(login, password, fio, pasport, phone, address, mail, birthday)
    console.log(statusReq);
    if(!statusReq){
        newtDialog("ошибка регистрации, проверьте праавильность вводимых данных")
    }
})

const btngoReg = document.querySelector('.btngoReg')
btngoReg.addEventListener('click', ()=>{
    let reg = document.querySelector('.reg')
    reg.classList.remove('hide')
    let auth = document.querySelector('.auth')
    auth.classList.add('hide')
})

const btngoAuth = document.querySelector('.btngoAuth')
btngoAuth.addEventListener('click', ()=>{
    let reg = document.querySelector('.reg')
    reg.classList.add('hide')
    let auth = document.querySelector('.auth')
    auth.classList.remove('hide')
})

//модалка
function newtDialog(text){
    let modal = document.getElementById('modal')
    modal.innerHTML=`${text} <button class="close" onclick="window.modal.close()">ок</button>`
    modal.showModal()
}

//отрисовка профиля
function showProfile(user){
    let profil = document.querySelector('.profil')
    removeHide('profil')
    profil.innerHTML=`<h2>Вы ${getRole(user.id_role)}</h2>
    <h3>${user.fio}</h3>
    <h3>Телефон ${user.phone}</h3>
    <h3>Адрес ${user.address}</h3>
    <h3>Почта ${user.mail}</h3>`
}

function getRole(role){
    if(role == 1){
        return 'Админ'
    } else if(role == 2){
        return 'Мастер'
    } else{
        return 'Клиент'
    }
}

async function Master(){
    removeHide('master')
    let listReqMaster = await window.api.reqMaster(id)
    let ul = document.querySelector('.masterList')
    ul.innerHTML=''

    for(let i = 0; i<listReqMaster.length;i++){
        let li = document.createElement('li')
        li.innerHTML = `<p>Название устройства: ${listReqMaster[i].name_equipment}</p>
            <p>Описание: ${listReqMaster[i].description}</p>
            <p>Тип неисправности: ${listReqMaster[i].name_defecte}</p>
            <p>Дата: ${normalDate(listReqMaster[i].date_create)}</p>
            <button id=${listReqMaster[i].id_request} class="execute">Выполнить</button>`
        ul.append(li)
    }
    let btns = document.querySelectorAll('.execute')
    btns.forEach(btn=>{
        btn.onclick= async()=>{
        await window.api.finishedReq(btn.id)
        Master()
    }
    })
    
}

async function Admin(){
    removeHide('admin')
    let statusConfirm = false
    let count = 0
    let ul 
    let list = await window.api.getReq()
    for(let i = 0; i<list.length; i++){
        ul = document.querySelector('.activeReq')
        if(list[i].status == 1){
            ul = document.querySelector('.completeReq')
        }
        let li = document.createElement('li')
        let work_status
        if(list[i].work_status == 0){
            work_status = 'Ожидание подтверждения'
            statusConfirm = true
        } else if(list[i].work_status == 1){
            work_status = 'В работе'
        } else if(list[i].work_status == 2){
            work_status = 'Завершен'
            count += 1
        }
        li.innerHTML = `<p>Деталь ${list[i].name_equipment}</p>
        <p>Тип неисправности: ${list[i].name_defecte}</p>
        <p>Описание: ${list[i].description}</p>
        <span style="color:violet;">${work_status}</span>`

        if(!list[i].employer){
            let p = document.createElement('p')
            p.textContent='Назначте исполнителя'
            let btn = document.createElement('button')
            btn.textContent='Подтвердить заявку'
            let select = document.createElement('select')
    
            let masters = await window.api.getMasters()
            for(let i = 0; i<masters.length;i++){
                let option = document.createElement('option')
                option.value = masters[i].id_user
                option.innerHTML = masters[i].fio
                select.append(option)
            }
            li.append(p,btn,select)
            btn.onclick = async()=>{
                await window.api.confirmReq(list[i].id_request, select.value)
                let ul1 = document.querySelector('.activeReq')
                let ul2 = document.querySelector('.completeReq')
                let ulDefects = document.querySelector('.listDefect')
                ul1.innerHTML=''
                ul2.innerHTML=''
                ulDefects.innerHTML=''
                Admin()
            }
        }
        
        ul.append(li)
    }
    if(statusConfirm){
        newtDialog('У вас есть не подтвержденные заявки')
    }

    let ulDefects = document.querySelector(".listDefect")
    let listDefects = await window.api.statistica()
    console.log(listDefects);
    listDefects.countDevice.forEach((elem)=>{
        let li = document.createElement("li")
        li.innerHTML = `
        <p>${elem.name_defecte}: ${(elem.count*100/listDefects.total.count).toFixed(2)}%</p>
        `
        ulDefects.append(li)
    })

    let statisticCount = document.querySelector(".statisticCount")
    statisticCount.innerHTML = `Количество выполненных заявок ${count}`
    
}


function User(){
    removeHide('client')
    getReqUser(id)
    getTypes()

    //добавление заявки на ремонт
    let sendReq = document.querySelector(`.sendReq`) 
    sendReq.addEventListener('click', async () => {
        let nameDetail = document.querySelector(`.nameDetail`).value
        let defectType = document.querySelector(`.defectType`).value
        let desc = document.querySelector(`.desc`).value
        if(!nameDetail || !defectType || !desc){
            newtDialog('Заполните все поля. Заявка отклонена.')
        }
        let status = await window.api.addReq(nameDetail, defectType, desc, id)
        if(status){
            getReqUser(id)
        }
    })

    //список заявок пользователя
    async function getReqUser(id){
        let listReqUser = await window.api.getReqUser(id);
        console.log(listReqUser );
        let ul = document.querySelector('.uluserlistReq')
        ul.innerHTML=''
        listReqUser.forEach(reg=>{
            console.log(listReqUser);
            let employer = reg.employer
            if(!employer){
                employer = 'Исполнитель не назначен'
            }

            let li = document.createElement('li')
            li.innerHTML = `<p>Название устройства: ${reg.name_equipment}</p>
            <p>Описание: ${reg.description}</p>
            <p>Тип неисправности: ${reg.name_defecte}</p>
            <p>Дата: ${normalDate(reg.date_create)}</p>
            <p>Id Исполнителя: ${employer}</p>`
        
            if(reg.work_status == 2){
                let p = document.createElement('p')
                p.innerHTML=`Дата завершения ${normalDate(reg.finished_date)}`
                li.append(p)
            }
            ul.append(li)
        })
    }
}


//типы неиспраностей
async function getTypes(){
    let types = await window.api.getTypes()
    let selectTypes = document.querySelector('.defectType')

    types.forEach(type=>{
        let option = document.createElement('option')
        option.value = type.id_defecte
        option.innerHTML = type.name_defecte
        selectTypes.append(option)
    })
    console.log(types);

}

//helpers function
//преобразование даты из базы
function normalDate(strintDate){
    let date = new Date(strintDate)
    return date.toLocaleDateString()
}

function addHide(nameClass){
    let element = document.querySelector(`.${nameClass}`)
    element.classList.add('hide')
}

function removeHide(nameClass){
    let element = document.querySelector(`.${nameClass}`)
    element.classList.remove('hide')
}