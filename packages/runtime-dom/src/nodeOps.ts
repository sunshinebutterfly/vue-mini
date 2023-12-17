const doc = document
export const nodeOps = {
	/**
	 * 
	 * @param child 
	 * @param parent 
	 * @param anchor 
	 */
	insert: (child, parent, anchor) => {
		parent.insertBefore(child, anchor || null)
	},

	/**
	 * 
	 * @param tag 
	 * @returns 
	 */
	createElement: (tag): Element => {
		const el = doc.createElement(tag)
		return el
	},

	setElementText: (el: Element, text) => {
		el.textContent = text
	},

	remove:(child:Element) =>{
		const parent = child.parentNode
		if(parent){
			parent.removeChild(child)
		}
	},

	CreateText:(text) => doc.createTextNode(text),

	setText: (node,text) =>{
		node.nodeValue = text
	},

	/**
	 * 创建 Comment 节点
	 */
	createComment: (text) => doc.createComment(text)
}