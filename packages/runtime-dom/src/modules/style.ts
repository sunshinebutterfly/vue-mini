import { isString } from "@vue/shared"

export function patchStyle(el: Element, prev, next) {
	const style = (el as HTMLElement).style
	const isCssStyle = isString(next)
	if (next && !isCssStyle) {
		for (const key in next) {
			setStyle(style, key, next[key])
		}
		if(prev && !isString(prev)){
			for (const key in prev) {
				if(next[key] == null){
					setStyle(style,key,'')
				}
			}
		}
	}
}

function setStyle(style: CSSStyleDeclaration, name: string, val: string | string[]) {
	style[name] = val
}