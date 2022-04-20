const puppeteer=require("puppeteer");
const sleep=async seconds=>new Promise(resolve=>setTimeout(resolve, seconds * 1000));
async function clickOnElement(page, elem, x = null, y = null) {
	const rect = await page.evaluate(el => {
		const { top, left, width, height } = el.getBoundingClientRect();
		return { top, left, width, height };
	}, elem);
	const _x = x !== null ? x : rect.width / 2;
	const _y = y !== null ? y : rect.height / 2;
	await page.mouse.click(rect.left + _x, rect.top + _y);
}
async function f()
{
	const b1=await puppeteer.launch({...false?{executablePath: browserPath}: {}, args: ['--disable-dev-shm-usage']});
	const b2=await puppeteer.launch({...false?{executablePath: browserPath}: {}, args: ['--disable-dev-shm-usage']});
	const a=await b1.newPage(), b=await b2.newPage();
	await a.goto("https://lichess.org/login", {waitUntil: 'domcontentloaded'});
	await a.keyboard.type("username");//username goes here
	await a.keyboard.press("Tab");
	await a.keyboard.type("password");//password goes here
	await a.keyboard.press("Enter");
	await sleep(1);
	await b.goto("https://lichess.org/analysis", {waitUntil: 'domcontentloaded'});
	await a.keyboard.press("ArrowDown");
	await a.screenshot({path: "page.png"});
	await a.goto("https://lichess.org/training/96398", {waitUntil: 'domcontentloaded'});
	await b.click(".switch");
	let j=0;
	let black=await a.evaluate(`document.getElementsByClassName("instruction")[0].innerHTML.indexOf("black")>0`);
	while(true)
	{
		const l=await a.evaluate(`Object.values(document.getElementsByClassName("tview2 tview2-column")[0].childNodes).map(n=>n.innerHTML.replace(/<.+\\/glyph>/g, ""));`);
		for(let i=0; i<l.length; i+=3)
			l[i]+='.';
		const pgn=l.join(" ");
		console.log(black);
		await b.click(`textarea[class="copyable autoselect"]`);
		await b.keyboard.press("Tab");
		await b.keyboard.down('Meta');
		await b.keyboard.press("A");
		await b.keyboard.up('Meta');
		await b.keyboard.sendCharacter(pgn);
		await b.click(".button.button-thin.action.text");
		await sleep(2);
		if(black)
		{
			await b.click(`button[title="Menu"]`);
			await sleep(1);
			await b.click(`a[data-icon="B"]`);
			await sleep(1);
		}
		await sleep(1);
		const line=await b.evaluate(`document.getElementsByTagName("svg")[0].innerHTML.split("x1=")[1].split("cgHash")[0].split('"').filter((_, i)=>i%2).map(n=>~~(n/54)*54+20);`);
		const elem = await a.$(".puzzle__board.main-board");
		await a.evaluate(() => {
		   document.querySelector('.puzzle__board.main-board').scrollIntoView();
		});
		await clickOnElement(a, elem, line[0], line[1]);
		await clickOnElement(a, elem, line[2], line[3]);
		await clickOnElement(a, elem, line[2], line[3]);
		if(black)
			await b.click(`a[data-icon="B"]`);
		await sleep(1);
		try
		{
			await a.click(".half.continue");
			await sleep(2);
			black=await a.evaluate(`document.getElementsByClassName("instruction")[0].innerHTML.indexOf("black")>0`);
			console.log(++j);
		}
		catch(_)
		{
			console.log(line);
			console.log(pgn);
			await a.screenshot({path: "page.png"});
		}
	}
	await a.screenshot({path: "page.png"});
}
f().then(_=>process.exit());