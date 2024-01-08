import { observer } from 'mobx-react-lite'
import Typography from '@mui/material/Typography'

const InputLabel = observer(({ label, labelGroup, hasSubProp, idInsteadOfFor = false, overwriteHtmlFor }) => {
  let id = ''
  let htmlFor = `input-${label}`
  let name = label

  if (hasSubProp) {
    name = label.split('-')[0]
  }
  id = `input-label-${labelGroup}-${name}`

  if (labelGroup != null && labelGroup !== '') {
    htmlFor = `input-${labelGroup}-${label}`
  }

  if (idInsteadOfFor) {
    id = htmlFor
    htmlFor = null
  }

  if (overwriteHtmlFor) {
    htmlFor = overwriteHtmlFor
  }

  return (
    <Typography
      className="noselect"
      component="label"
      id={id}
      htmlFor={htmlFor}
      sx={{
        fontFamily: 'monospace',
        fontSize: 12,
        color: 'text.disabled',
        cursor: 'pointer',
        '&:hover': { color: 'text.secondary' },
      }}
    >
      {name}
    </Typography>
  )
})

export default InputLabel
