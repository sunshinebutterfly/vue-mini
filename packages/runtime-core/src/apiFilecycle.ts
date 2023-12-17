import { LifecycleHooks } from "./component";

export function injectHook(type: LifecycleHooks, hook: Function, traget) {
	if (traget) {
		traget[type] = hook
		return hook
	}
}

export const createHook = (lifecycle: LifecycleHooks) => {
	return (hook, traget) => injectHook(lifecycle, hook, traget)
}

export const OnBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const OnMounted = createHook(LifecycleHooks.MOUNTED)