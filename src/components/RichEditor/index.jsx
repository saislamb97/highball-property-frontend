import React, { useMemo, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { useTextEditor } from "./useTextEditor";
import { useTheme, Box, IconButton, Tooltip } from '@mui/material';
import { AddPhotoAlternate, FormatAlignCenter, FormatAlignJustify, FormatAlignLeft, FormatAlignRight, FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, FormatQuote, FormatUnderlined, Redo, StrikethroughS, Title, Undo } from '@mui/icons-material';
import { tokens } from "src/theme";
import EmojiPicker from './EmojiPicker';
import HeadingPicker from './HeadingPicker';

export const TopToolbar = ({ editor }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [headingLevel, setHeadingLevel] = useState(0);
  const [headingAnchorEl, setHeadingAnchorEl] = useState(null);
  const handleHeadingSelected = h => {
    editor.chain().focus().toggleHeading({ level: h }).run()
    console.log(h)
    setHeadingLevel(h)
  }

  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null);
  const handleEmojiSelected = e => {
    editor.chain().focus().insertContent(e.emoji).run()
  }

  const topToolbars = useMemo(() => [
    { name: 'heading', render: headingLevel ? <Box fontWeight={'bold'} fontSize={17} lineHeight={1}>H{headingLevel}</Box> : <Title/>,
      handleClick: e => { setHeadingAnchorEl(e.currentTarget) },
      isActive: _ => headingLevel > 0 
        ? editor.isActive('heading', { level: headingLevel }) 
        : false
    },
    { name: 'bold', render: <FormatBold/>,
      handleClick: e => editor.chain().focus().toggleBold().run()
    },
    { name: 'underline', render: <FormatUnderlined/>,
      handleClick: e => editor.chain().focus().toggleUnderline().run()
    },
    { name: 'italic', render: <FormatItalic/>,
      handleClick: e => editor.chain().focus().toggleItalic().run()
    },
    { name: 'strike', render: <StrikethroughS/>,
      handleClick: e => editor.chain().focus().toggleStrike().run()
    },
    { name: 'blockquote', render: <FormatQuote/>,
      handleClick: e => editor.chain().focus().toggleBlockquote().run()
    },

    { name: 'bulletList', render: <FormatListBulleted/>,
      handleClick: e => editor.chain().focus().toggleBulletList().run()
    },
    { name: 'orderedList', render: <FormatListNumbered/>,
      handleClick: e => editor.chain().focus().toggleOrderedList().run()
    },

    { name: 'align-left', render: <FormatAlignLeft/>,
      handleClick: e => editor.chain().focus().setTextAlign("left").run()
    },
    { name: 'align-center', render: <FormatAlignCenter/>,
      handleClick: e => editor.chain().focus().setTextAlign("center").run()
    },
    { name: 'align-right', render: <FormatAlignRight/>,
      handleClick: e => editor.chain().focus().setTextAlign("right").run()
    },
    { name: 'align-justify', render: <FormatAlignJustify/>,
      handleClick: e => editor.chain().focus().setTextAlign("justify").run()
    },

    
    { name: 'image', render: <AddPhotoAlternate/>,
      handleClick: e => { window.prompt('image url ') }
    },
    { name: 'emoji', render: <span style={{ transform: 'scale(.8)',lineHeight: 1 }}>😀</span>,
      handleClick: e => { setEmojiAnchorEl(e.currentTarget) }
    },

    { name: 'undo', render: <Undo/>,
      disabled: !editor.can().undo(),
      handleClick: e => editor.chain().focus().undo().run()
    },
    { name: "redo", render: <Redo/>,
      disabled: !editor.can().redo(),
      handleClick: e => editor.chain().focus().redo().run()
    },
  ], [editor, headingLevel])

  return <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'}>
    { topToolbars.map(t => 
      <Tooltip placement="top" title={ t.name }>
        <IconButton key={ t.name } onClick={ t.handleClick } disabled={ t.disabled } 
          sx={{ padding: '6px', borderRadius: 1,
            color: (t.isActive ? t.isActive() : editor.isActive(t.name)) 
              ? colors.red[300] 
              : 'none' 
          }}
          >
          { t.render }
        </IconButton>
      </Tooltip>
    )}
    
    <HeadingPicker value={headingLevel} anchorEl={headingAnchorEl} onClose={e => setHeadingAnchorEl(null)} onChange={ handleHeadingSelected }/>
    <EmojiPicker anchorEl={emojiAnchorEl} onClose={e => setEmojiAnchorEl(null)} 
      onChange={ handleEmojiSelected }/>
  </Box>
}

export default function RichEditor({ 
  height = '200px',
  value, placeholder, editable, onChange = _ => '', sx = {}, ...editorOptions
}) {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const editor = useTextEditor({
    value,
    placeholder,
    onChange,
    editable,
    ...editorOptions
  });

  

  return <Box sx={sx}>
    { editor && <TopToolbar editor={editor}/> }

    <Box sx={{ 
      '& .ProseMirror-focused': { outline: 'none' }, 
      '& .ProseMirror': { height } 
    }} 
      borderRadius={ '4px 4px 0 0' } borderBottom={ `1px solid ${colors.primary[100]}` } backgroundColor={ colors.textfieldBg } padding={2} margin={1}
      >
      <EditorContent editor={editor}/>
    </Box>
  </Box>
}
