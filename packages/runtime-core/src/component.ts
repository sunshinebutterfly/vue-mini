import { reactive } from "@vue/reactivity"
import { isFunction, isObject } from "@vue/shared"
import { OnBeforeMount, OnMounted } from "./apiFilecycle"

let uid = 0

export function createComponentInstance(vnode) {
	const type = vnode.type
	const instance = {
		uid: uid++,
		vnode,
		type,
		subTree: null,
		effect: null,
		update: null,
		render: null,
		isMounted: false,
		bc: null,
		c: null,
		bm: null,
		m: null,
	}

	return instance
}

export function setupComponent(instance){
	setupStatefulComponent(instance)
}
function setupStatefulComponent(instance){
	const component = instance.type
	const { setup} = component
	if(setup){
		const setupResult = setup()
		handleSetupResult(instance,setupResult)
	}else{
		finishComponentSetup(instance)
	}
}

export function handleSetupResult(instance,setupResult){
	if(isFunction(setupResult)){
		instance.render = setupResult
	}
	finishComponentSetup(instance)
}

export function finishComponentSetup(instance){
	const Component = instance.type
	if(!instance.render){
		instance.render = Component.render
	}
	

	applyOptions(instance)
}

export const enum LifecycleHooks{
	BEFORE_CREATE = 'bc',
	CREATED = 'c',
	BEFORE_MOUNT = 'bm',
	MOUNTED = 'm',
}

function applyOptions(instance: any){
	const {data:dataOptions,beforeCreate,created,beforeMount,mounted} = instance.type

	if(beforeCreate){
		callHook(beforeCreate,instance.data)
	}
	if(dataOptions){
		console.log(dataOptions);
		const data = dataOptions()
		if(isObject(data)){
			instance.data = reactive(data)
		}
	}

	if(created){
		callHook(created,instance.data)
	}
	function registerLifecycleHook(register:Function,hook?: Function){
		register(hook?.bind(instance.data),instance)
	}
	registerLifecycleHook(OnBeforeMount,beforeMount)
	registerLifecycleHook(OnMounted,mounted)
}
function callHook(hook: Function,proxy){
	hook.bind(proxy)()
}