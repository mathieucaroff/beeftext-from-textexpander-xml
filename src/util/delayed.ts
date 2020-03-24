export let delayed = (f, t = 0) => () => setTimeout(f, t)
