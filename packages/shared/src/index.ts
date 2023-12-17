/**
 * 判断是否为数组
 */
export const isArray = Array.isArray

/**
 * 判断是否为对象
 * @param val 
 * @returns 
 */
export const isObject = (val: unknown) => 
	val !== null && typeof val ==='object'

export const hasChanged = (value: any, oldValue: any): boolean =>
!Object.is(value, oldValue)

/**
 * 判断是否为一个 string
 */
export const isString = (val: unknown): val is string => typeof val === 'string'

export const isFunction = (val:unknown): val is Function => {
	return typeof val === 'function'
}

export const extend = Object.assign


export const EMPTY_OBJ: { readonly [key: string]: any } = {}

const onRE = /^on[^a-z]/
export const isOn = (key: string) =>onRE.test(key) 