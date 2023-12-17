import { ShapeFlags } from "packages/shared/src/shapeFlags"
import { Comment, Fragment, Text, VNode, isSameVNodeType } from "./vnode"
import { EMPTY_OBJ, isString } from "@vue/shared"
import { normalizeVNode, renderComponentRoot } from "./componentRenderUtils"
import { createComponentInstance, setupComponent } from "./component"
import { ReactiveEffect } from "packages/reactivity/src/effect"
import { queuePreFlushCb } from "./scheduler"

export interface RendererOptions {
	/**
	 * 为指定的element 打补丁
	 * @param el 
	 * @param key 
	 * @param prevValue 
	 * @param nextValue 
	 */
	patchProp(el: Element, key: string, prevValue: any, nextValue: any): void
	/**
	 * 为指定的 element 设置 text
	 * @param node 
	 * @param text 
	 */
	setElementText(node: Element, text: string): void

	/**
	 * 插入指定el 到 parent中， anchor 表示插入位置，即锚点
	 * @param el 
	 * @param parent 
	 * @param anchor 
	 */
	insert(el, parent: Element, anchor?): void

	/**
	 * 创建 element
	 * @param type 
	 */
	createElement(type: string)

	/**
	 * 
	 * @param el 
	 */
	remove(el: Element)

	CreateText(text:string)

	setText(node,text)

	createComment(text:string)
}

export function createRenderer(options: RendererOptions) {
	return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {

	const {
		insert: hostInsert,
		setElementText: hostSetElementText,
		patchProp: hosPatchProp,
		createElement: hostCreateElement,
		remove: hostRemove,
		CreateText:hostCreateText,
		setText:hostSetText,
		createComment:hostCreateComment
	} = options

	const processText = (oldVNode, newVNode, container, anchor) => {
		if(oldVNode == null){
			newVNode.el = hostCreateText(newVNode.children)
			hostInsert(newVNode.el,container,anchor)
		}else{
			const el = (newVNode.el = oldVNode.el!)
			if(newVNode.children !== oldVNode.children){
				hostSetText(el,newVNode.children)
			}
		}
	}
	/**
   * Fragment 的打补丁操作
   */
  const processFragment = (oldVNode, newVNode, container, anchor) => {
    if (oldVNode == null) {
      mountChildren(newVNode.children, container, anchor)
    } else {
      patchChildren(oldVNode, newVNode, container, anchor)
    }
  }
	const processComponent = (oldVNode, newVNode, container, anchor) =>{
		if(oldVNode == null){
			mountComponent(newVNode,container,anchor)
		}else{

		}
	}
	const processComment = (oldVNode, newVNode, container, anchor) => {
		if(oldVNode == null){
			newVNode.el = hostCreateComment(newVNode.children)
			hostInsert(newVNode.el,container,anchor)
		}else{
			newVNode.el = oldVNode.el
		}
	}
	
	const processElement = (oldVNode, newVNode, container, anchor) => {
		if (oldVNode === null) {
			// 挂载
			mountElment(newVNode, container, anchor)
		} else {
			// 更新
			patchElement(oldVNode, newVNode)
		}
	}
	const mountComponent = (initiaVNode, container, anchor)=>{
		initiaVNode.comment = createComponentInstance(initiaVNode)
		const instance = initiaVNode.comment

		setupComponent(instance)

		setupRenderEffect(instance,initiaVNode,container,anchor)
	}

	const setupRenderEffect= (instance,initiaVNode,container,anchor)=>{
		const componentUpdateFn = () =>{
			if(!instance.isMounted){

				const {bm, m} = instance

				if(bm){
					bm()
				}

				const subTree = (instance.subTree = renderComponentRoot(instance))
				patch(
					null,
					subTree,
					container,
					anchor
				)

				if(m){
					m()
				}
				initiaVNode.el = subTree.el

				instance.isMounted = true
			}else{
				let { next,vnode} =instance

				if(!next){
					next = vnode
				}
				const nextTree = renderComponentRoot(instance)
				const prevTree = instance.subTree

				instance.subTree = nextTree
				patch(prevTree,nextTree,container,anchor)
				next.el = nextTree.el
			}
		}

		const effect = (instance.effect = new ReactiveEffect(componentUpdateFn,()=>queuePreFlushCb(update)))

		const update = instance.update = () => effect.run()

		update()
	}

	const mountElment = (vnode, container, anchor) => {
		const { type, props, shapeFlag } = vnode
		// 1. 创建element
		const el = (vnode.el = hostCreateElement(type))

		// 2. 创建text
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			hostSetElementText(el, vnode.children)
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {

		}

		// 3. 设置porps
		if (props) {
			for (const key in props) {
				hosPatchProp(el, key, null, props[key])
			}
		}
		// 4. 插入
		hostInsert(el, container, anchor)
	}

	const patchElement = (oldVNode, newVNode) => {
		const el = (newVNode.el = oldVNode.el)

		const oldProps = oldVNode.props || EMPTY_OBJ
		const newProps = newVNode.props || EMPTY_OBJ

		patchChildren(oldVNode, newVNode, el, null)

		patchProps(el, newVNode, oldProps, newProps)
	}
	/**
   * 挂载子节点
   */
  const mountChildren = (children, container, anchor) => {
    // 处理 Cannot assign to read only property '0' of string 'xxx'
    if (isString(children)) {
      children = children.split('')
    }
    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

	const patchProps = (el: Element, vnode, oldProps, newProps) => {
		if (oldProps !== newProps) {
			for (const key in newProps) {
				const next = newProps[key]
				const prev = oldProps[key]
				if (next !== prev) {
					hosPatchProp(el, key, prev, next)
				}
			}
		}
		if (oldProps !== EMPTY_OBJ) {
			for (const key in oldProps) {
				if (!(key in newProps)) {
					hosPatchProp(el, key, oldProps[key], null)
				}
			}
		}
	}

	const patchChildren = (oldVNode, newVNode, container, anchor) => {
		const c1 = oldVNode && oldVNode.children
		const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
		const c2 = newVNode && newVNode.children
		const { shapeFlag } = newVNode

		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {

			}
			if (c1 !== c2) {
				hostSetElementText(container, c2 as string)
			}
		} else {
			if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
				if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
					// diff 运算
				} else {
					// 卸载
				}
			} else {
				if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
					// 删除就文本
					hostSetElementText(container, '')
				}
				if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {

				}
			}
		}
	}

	const patch = (oldVNode, newVNode, container, anchor = null) => {
		if (oldVNode === newVNode) {
			return
		}

		// 如果旧节点存在，并且新旧节点标签不一样。执行卸载
		if(oldVNode && !isSameVNodeType(newVNode,oldVNode)){
			unmount(oldVNode)
			oldVNode = null
		}

		const { type, shapeFlag } = newVNode
		switch (type) {
			case Text:
				processText(oldVNode,newVNode,container,anchor)
				break
			case Fragment:
				break
			case Comment:
				processComment(oldVNode,newVNode,container,anchor)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(oldVNode, newVNode, container, anchor)
				} else if (shapeFlag & ShapeFlags.COMPONENT) {
					processComponent(oldVNode, newVNode, container, anchor)
				}
		}
	}

	const unmount = (VNode) =>{
		hostRemove(VNode.el)
	}
	const render = (vnode, container) => {
		if (vnode === null) {
			if(container._vnode){
				unmount(container._vnode)
			}
		} else {
			patch(container._vnode || null, vnode, container)
		}
		container._vnode = vnode
	}

	return {
		render
	}
}