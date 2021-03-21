
export { waterfall };

function waterfall (tasks : Array<Function>, donefn? : (err, ...results)=> void ) {

	let doFunc = (idx, ...args)=>{

		let task = tasks[idx];
		let nextIdx = idx+1;
		let isEnd = nextIdx >= tasks.length;

		task(...args, function cb (err, ...args){
			if (err || isEnd) {
				if (donefn){
					donefn(err, ...args);
				}
				return;
			}
			doFunc(nextIdx, ...args);
		});
	};

	doFunc(0);

}