import { useEffect, useMemo, useState } from 'react'
import { FixedSizeList as VirtualList } from 'react-window'
import { observer } from 'mobx-react-lite'

import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck'
import LibraryAddOutlinedIcon from '@mui/icons-material/LibraryAddOutlined'
import LinearProgress from '@mui/material/LinearProgress'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'

import { getFontData, preloadSetOfFontImages, getCategoryMap, getWeightMap } from '../../utility/fonts'
import missingPreview from '../../assets/missingPreview.png'

const ROW_HEIGHT = 52

const VirtualRow = ({ data, index, style }) => {
  const { items, addFont } = data
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
        height: `${ROW_HEIGHT}px`,
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

const FontDialog = observer(({ store, open, onClose }) => {
  const fontData = getFontData()

  const firstOfEachFont = useMemo(() => {
    /* eslint-disable react-hooks/exhaustive-deps */
    if (fontData.length === 0) return []
    return Object.values(
      fontData.reduce((accum, font) => {
        /* eslint-disable no-param-reassign */
        if (font.name in accum) {
          accum[font.name].numVariants += 1
          accum[font.name].weights.push(font.weight)
          return accum
        }
        accum[font.name] = {
          ...font,
          numVariants: 1,
          weights: [font.weight],
          isAdded: store.project.fonts.find((someFont) => someFont.name === font.name),
        }
        return accum
      }, {})
    )
  }, [
    fontData,
    store.project.fonts,
    store.project.fonts.length,
  ])

  const categories = getCategoryMap()
  const [shownCategories, setShownCategories] = useState([])
  useEffect(() => {
    setShownCategories(categories)
  }, [categories])

  const weightMap = getWeightMap()
  const [weights, setWeights] = useState({})
  const [shownWeight, setShownWeight] = useState(0)
  useEffect(() => {
    setWeights({ 0: 'Any Weight', ...weightMap })
  }, [weightMap])

  const [imagesLoading, setImagesLoading] = useState(false)
  const [imagesLoadedPercent, setImagesLoadedPercent] = useState(0)
  useEffect(() => {
    if (open === true && imagesLoading === false) {
      setImagesLoading(true)
      preloadSetOfFontImages(firstOfEachFont, (numLoaded) => {
        setImagesLoadedPercent((numLoaded / firstOfEachFont.length) * 100)
      })
    }
  }, [
    open,
    imagesLoading,
    firstOfEachFont,
  ])

  const focusSearchField = () => {
    document.getElementById('add-fonts-search-field')?.focus()
  }
  useEffect(() => {
    if (imagesLoadedPercent === 100) { focusSearchField() }
  }, [imagesLoadedPercent])

  const [searchQuery, setSearchQuery] = useState('')
  const filteredFontList = firstOfEachFont
    .filter((font) => (
      shownCategories.includes(font.category)
    ))
    .filter((font) => (
      shownWeight === 0 || font.weights.includes(shownWeight)
    ))
    .filter((font) => (
      font.name.toLowerCase().includes(searchQuery.toLowerCase())
    ))

  const addFontFamily = (font) => {
    const allFontsThisFamily = fontData.filter((f) => f.name === font.name)
    store.addFonts(allFontsThisFamily)
  }

  if (fontData.length === 0) return null
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEntered: focusSearchField }}
    >
      <DialogTitle>Add Fonts to your Project</DialogTitle>
      <LinearProgress variant="determinate" color="secondary" value={imagesLoadedPercent} />

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 12,
          top: 12,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <TextField
          id="add-fonts-search-field"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name"
          fullWidth
          variant="outlined"
          color="secondary"
          disabled={imagesLoadedPercent !== 100}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchQuery !== '' && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear"
                  onClick={() => setSearchQuery('')}
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 2 }}
        />

        <Box sx={{ display: 'flex' }}>
          <VirtualList
            style={{ flexGrow: 1 }}
            itemData={{
              items: filteredFontList,
              addFont: addFontFamily,
            }}
            itemCount={filteredFontList.length}
            height={window.innerHeight - 300}
            itemSize={ROW_HEIGHT}
          >
            {VirtualRow}
          </VirtualList>

          <Box sx={{ width: '110px', marginLeft: 2 }}>
            Shown
            <Box sx={{ marginLeft: 1, marginBottom: 2, marginTop: 0.5, fontSize: 14 }}>
              {filteredFontList.length}{' '}
              <Box sx={{ color: 'action.disabled', display: 'inline-block' }}>of {firstOfEachFont.length}</Box>
            </Box>

            Categories
            <FormGroup sx={{ marginLeft: 0, marginBottom: 2 }}>
              {categories.map((category, idx) => (
                <FormControlLabel
                  key={category}
                  label={category}
                  sx={{
                    margin: 0,
                    marginBottom: '-4px',
                    marginTop: idx === 0 && 0.5,
                    '& .MuiFormControlLabel-label': { fontSize: 14 },
                  }}
                  control={(
                    <Checkbox
                      color="secondary"
                      checked={shownCategories.includes(category)}
                      onChange={(event) => {
                        if (event.target.checked === false) {
                          setShownCategories(shownCategories.filter((c) => c !== category))
                        } else {
                          setShownCategories([...shownCategories, category])
                        }
                      }}
                      sx={{
                        width: '26px',
                        height: '26px',
                        '& .MuiSvgIcon-root': { fontSize: 18 },
                      }}
                    />
                  )}
                />
              ))}
            </FormGroup>

            Weight
            <RadioGroup
              value={shownWeight}
              onChange={(event) => setShownWeight(parseInt(event.target.value, 10))}
              sx={{ marginLeft: 0 }}
            >
              {Object.entries(weights).map(([weight, weightLabel], idx) => (
                <FormControlLabel
                  key={weightLabel}
                  value={`${weight}`}
                  label={weightLabel}
                  sx={{
                    margin: 0,
                    marginBottom: '-4px',
                    marginTop: idx === 0 && 0.5,
                    '& .MuiFormControlLabel-label': { fontSize: 14 },
                  }}
                  control={(
                    <Radio
                      color="secondary"
                      sx={{
                        width: '26px',
                        height: '26px',
                        '& .MuiSvgIcon-root': { fontSize: 18 },
                      }}
                    />
                  )}
                />
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
})

export default FontDialog
