let isFlushPending = false

const pendingPreFlushCbs: Function[] = []

const resolvePromise = Promise.resolve() as Promise<any>

let currentFlushPromise : Promise<void> |null = null

export function queuePreFlushCb(cb:Function){
	queueCb(cb,pendingPreFlushCbs)
}

/**
 * 
 * @param cb 
 * @param pendingQueue 
 */
function queueCb(cb:Function,pendingQueue:Function[]){
	pendingQueue.push(cb)
	queueFlush()
}

function queueFlush(){
	if(!isFlushPending){
		isFlushPending = true 
		currentFlushPromise = resolvePromise.then(flushJobs)
	}
}

function flushJobs(){
	 isFlushPending = false
	 flushPreFlushCbs()
}

export function flushPreFlushCbs(){
	let activePreflushCbs = [...new Set(pendingPreFlushCbs)]
	pendingPreFlushCbs.length = 0

	for (let i = 0; i < activePreflushCbs.length; i++) {
		activePreflushCbs[i]()
	}
}