
export { each };

function each (items: Array<any>, eachfn: (item, cb: (err?)=>void ) => void, donefn: (err) => void ) {


	let isStop = false;

	let leftCount = items.length;
	let eachDone = (err)=>{
		if (isStop) return;

		if (err) {
			donefn(err);
			isStop = true;
			return;
		}

		leftCount--;
		if (leftCount == 0) {
			donefn(err);
		}
	}

	for (let idx = 0; idx < items.length; idx++) {
		let each = items[idx];
		let isDone = false;
		
		let eachCB = (err)=>{
			if (isDone) return;
			isDone = true;

			eachDone(err);
		}

		eachfn(each, eachCB);
		
	}
}