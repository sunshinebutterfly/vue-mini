import { ShapeFlags } from "packages/shared/src/shapeFlags"
import { createVNode } from "./vnode"

/**
 * 标准化 VNode
 */
export function normalizeVNode(child) {
	if (typeof child === 'object') {
		return cloneIfMounted(child)
	} else {
		return createVNode(Text, null, String(child))
	}
}

/**
 * clone VNode
 */
export function cloneIfMounted(child) {
	return child
}

export function renderComponentRoot(instance) {
	const {vnode,render,data} = instance
	let result

	try {
		if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT){
			console.log(data);
			
			result = normalizeVNode(render!.call(data))
		}	
	} catch (error) {
		
	}
	return result
}
