import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck'
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined'

import missingPreview from '../../assets/missingPreview.png'

const FontVirtualRow = ({ data, index, style }) => {
  const { items, addFont, rowHeight } = data
  const font = items[index]
  const rightIcon = font.isAdded ? (
    <LibraryAddCheckIcon
      color="secondary"
      sx={(theme) => ({ marginRight: `calc(${theme.spacing(1)} + 6px)` })}
    />
  ) : (
    <IconButton
      onClick={() => addFont(font)}
      sx={{
        width: '36px',
        height: '36px',
        marginRight: 1,
      }}
    >
      <LibraryAddOutlinedIcon />
    </IconButton>
  )

  return (
    <Box
      style={style}
      sx={{
        height: `${rowHeight}px`,
        backgroundColor: index % 2 === 0 && 'rgba(255, 255, 255, 0.08)',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          padding: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box>
          <img
            src={font.image}
            alt={`font preview of ${font.name}`}
            style={{
              display: 'block',
              height: '16px',
              filter: font.image !== missingPreview && 'invert(1)',
            }}
          />
          <Box
            sx={{
              color: 'text.disabled',
              font: 'monospace',
              fontSize: '12px',
              lineHeight: '12px',
              paddingTop: 1,
            }}
          >
            {font.name} {font.numVariants > 1 && `(${font.numVariants} Variants)`}
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {rightIcon}
      </Box>
    </Box>
  )
}

export default FontVirtualRow
