const TelegramAPI = require('node-telegram-bot-api');
const DB = require('./db');

const token = '2046370890:AAF7Iq98U_ADC1V8J_Fu71tST_fhWFUdnkg';

const bot = new TelegramAPI(token, {polling: true});

let waitingUsers = [];
let waitingCourses = new Map();

const start = async () => {

	await bot.setMyCommands([
		{command: '/start', description: 'Start the work!'},
		{command: '/info', description: 'Get some info'},
		{command: '/new', description: 'Add a new Course'},
		{command: '/courses', description: 'Show all courses'},
		{command: '/getworks', description: 'Shows all homeworks'},
		// {command: '/deleteCourse', description: 'Delete a course'},
		// {command: '/deleteWork', description: 'Delete a work'},
		{command: '/work', description: 'Add a new homework'}
	])
	try {
		bot.on('message', async msg => {
			console.log(msg);
			const text = msg.text;
			const chatId = msg.chat.id;
		
			if (text === '/start') {
				await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/972/d03/972d03b1-80b4-43ac-8063-80e62b150d91/1.webp');
				return bot.sendMessage(chatId, `Hi! I am home_worker_bot. And I am here to help you manage youre homeworks!`);
			} 
			if (text === '/info') {
				return bot.sendMessage(chatId, `Youre name is ${msg.from.first_name} ${msg.from.last_name}`);
			}
			if (text === '/getworks') {
				const resp = await DB.getAllWorks();
				resp.forEach(async element => {
					await bot.sendMessage(chatId, `${element.name}:\n${element.description}`)
				})
				return;
			}
			if (text === '/new') {
				await bot.sendMessage(chatId, `Choose a name for the course you want to add.\n EXAMPLE: "System Programming (MON: 14:10, FRY: 14:10)"`);
				waitingUsers.push(chatId);
				console.log(waitingUsers);
				return;
			}
			if (text === '/courses') {
				const resp = await DB.getAllCourses();
				console.log(resp);

				const inline_keyboardTemp = [];
				resp.forEach(element => {
					inline_keyboardTemp.push([{text: element.name, callback_data: element.id}]);
				});

				const reply_markupTemp = JSON.stringify({
					inline_keyboard: inline_keyboardTemp
				})

				const lessonOptions = {
					reply_markup: reply_markupTemp
				}

				return bot.sendMessage(chatId, 'this is all courses available', lessonOptions);
			}
			if (text === '/work') {
				await bot.sendMessage(chatId, `Here are all the courses in my database! For which one you want to add a home work?`)

				const resp = await DB.getAllCourses();
				console.log(resp);

				const inline_keyboardTemp = [];
				resp.forEach(element => {
					inline_keyboardTemp.push([{text: element.name, callback_data: element.id}]);
				});

				const reply_markupTemp = JSON.stringify({
					inline_keyboard: inline_keyboardTemp
				})

				const lessonOptions = {
					reply_markup: reply_markupTemp
				}

				return bot.sendMessage(chatId, 'Choose: ', lessonOptions)
			}
			if (waitingUsers.includes(chatId)) {
				let index = waitingUsers.indexOf(chatId);
				if (index > -1) {
					waitingUsers.splice(index, 1);
				}

				if (text.split(' ')[0] === "work!") {
					if (typeof waitingCourses[chatId] !== 'undefined') {
						const resp =  DB.createWork(text, waitingCourses[chatId]);
						waitingCourses.delete(chatId);
						return bot.sendMessage(chatId, `You have added a homework!`);
					}
					return bot.sendMessage(chatId, `Something wen wrong`);
				}

				const resp = await DB.createCourse(text);
				return bot.sendMessage(chatId, `Created a course: ${resp.rows[0]}`);
			}
			return bot.sendMessage(chatId, `I dont understand youre message`);
		})
		bot.on('callback_query', msg => {
			const data = msg.data;
			const chatID = msg.message.chat.id;

			waitingUsers.push(chatID);
			waitingCourses[chatID] = data;
			return bot.sendMessage(chatID, `Type description of the homework for ${msg.data}!`)
		})
	} catch (error) {
		console.log('error')
	}
	
}

start();