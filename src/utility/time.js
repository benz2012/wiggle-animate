const sleep = (ms) => (
  new Promise((resolve) => { setTimeout(resolve, ms) })
)

const timeStampMicro = () => performance.now()

const timeStampMilli = () => Math.round(timeStampMicro())

export {
  sleep,
  timeStampMicro,
  timeStampMilli,
}
