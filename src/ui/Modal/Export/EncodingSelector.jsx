import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

const EncodingSelector = ({ options, keys, value, handleChange }) => (
  <Select
    value={value}
    onChange={handleChange}
    sx={(theme) => ({
      width: '200px',
      '& .MuiInputBase-input': {
        margin: '0px',
        padding: theme.spacing(0.25),
        paddingLeft: theme.spacing(1),
        fontSize: 12,
        fontFamily: 'monospace',
      },
    })}
  >
    {options.map((option, index) => (
      <MenuItem
        key={keys[index]}
        value={keys[index]}
        sx={(theme) => ({
          fontSize: 12,
          fontFamily: 'monospace',
          padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
        })}
      >
        {option}
      </MenuItem>
    ))}
  </Select>
)

export default EncodingSelector
