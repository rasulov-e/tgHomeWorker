const TelegramAPI = require('node-telegram-bot-api');

const token = '2046370890:AAF7Iq98U_ADC1V8J_Fu71tST_fhWFUdnkg';

const bot = new TelegramAPI(token, {polling: true});

const lessonOptions = {
	reply_markup: JSON.stringify({
		inline_keyboard: [
			[{text: 'Text button', callback_data: '1'}],
			[{text: 'Text button', callback_data: '2'}],
			[{text: 'Text button', callback_data: '3'}],
		]
	})
}

const start = () => {
	bot.setMyCommands([
		{command: '/start', description: 'Start talking'},
		{command: '/info', description: 'Get info on yourself'},
	])
	bot.on('message', async msg => {
		const text = msg.text;
		const chatId = msg.chat.id;
	
		if (text === '/start') {
			await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/972/d03/972d03b1-80b4-43ac-8063-80e62b150d91/1.webp');
			return bot.sendMessage(chatId, `Hi! I am home_worker_bot. And I am here to help you manage youre homeworks!`);
		} 
		if (text === '/info') {
			return bot.sendMessage(chatId, `Youre name is ${msg.from.first_name} ${msg.from.last_name}`);
		}

		if (text === '/newHomework') {
			await bot.sendMessage(chatId, `Here are all the courses in my database! For which one you want to add a home work?`)
			return bot.sendMessage(chatId, 'Choose: ', lessonOptions)
		}
		return bot.sendMessage(chatId, `I dont understand youre message`);
	})
	bot.on('callback_query', msg => {
		const data = msg.data;
		const chatID = msg.message.chat.id;
		return bot.sendMessage(chatID, `Type description of the homework for ${msg.data}!`)
	})
}

start();