
export { parallel, parallelWithEach };



function parallel (tasks: Array< (cb:(err, result)=>void) => void >, donefn: (err, results)=> void ) {
	parallelWithEach(tasks, null, donefn);
}

function parallelWithEach (tasks: Array< (cb:(err, result)=>void) => void >, eachfn: (err, results) => void, donefn: (err, results) => void ) {

	if (tasks.length == 0) {
		donefn(null, null);
		return;
	}

	let results = new Array<any>(tasks.length);

	let isStop = false;

	let leftTaskCount = tasks.length;
	let eachDone = (err)=>{
		if (isStop) return;

		if (eachfn) {
			eachfn(err, results);
		}

		if (err) {
			donefn(err, results);
			isStop = true;
			return;
		}

		leftTaskCount--;
		if (leftTaskCount == 0) {
			donefn(err, results);
		}
	}

	for (let idx = 0; idx < tasks.length; idx++) {
		let eachTask = tasks[idx];
		let isDone = false;
		let toIdx = idx;
		let eachCB = (err, result)=>{
			if (isDone) return;
			isDone = true;

			results[toIdx] = result;

			eachDone(err);
		}

		eachTask(eachCB);
		
	}
}