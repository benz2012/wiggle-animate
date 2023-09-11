export * from './controllers'
export * from './hovers'
export * from './paths'
export * from './playhead'
export * from './selector'
export * from './stage'

const clearShadowContext = (ctx) => {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

export { clearShadowContext }
