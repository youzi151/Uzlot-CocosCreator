
export { eachSeries };

function eachSeries (items : Array<any>, eachDo : (item, cb:(err?)=>void )=>void, donefn? : (err)=>void ) {

	if (items.length == 0) {
		donefn(null);
		return;
	}

	let doFunc = (idx)=>{

		let item = items[idx];
		let nextIdx = idx+1;
		let isEnd = nextIdx >= items.length;

		eachDo(item, function cb (err){
			if (err || isEnd) {
				if (donefn){
					donefn(err);
				}
				return;
			}
			doFunc(nextIdx);
		});
	};

	doFunc(0);

}