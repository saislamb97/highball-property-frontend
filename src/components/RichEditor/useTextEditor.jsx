import { useTheme } from '@mui/material';
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Link from '@tiptap/extension-link';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import TipTapTypography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Blockquote from '@tiptap/extension-blockquote';
import Gapcursor from "@tiptap/extension-gapcursor";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Youtube from "@tiptap/extension-youtube";
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { createLowlight, common } from "lowlight";
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import Heading from '@tiptap/extension-heading';
const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  Document,
  Paragraph,
  Text,
  TipTapTypography,
  Underline,
  Blockquote,
  Link.configure({
    protocols: [
      "https",
      "mailto",
      {
        scheme: "tel",
        optionalSlashes: true
      }
    ],
    HTMLAttributes: {
      rel: 'noopener noreferrer',
      target: null,
    },
  }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
    codeBlock: false
  }),
  Heading.configure({
    HTMLAttributes: {
      class: 'custom-heading',
    },
    levels: [1, 2, 3, 3, 4, 5, 6],
  }),
  Table.configure({
    resizable: true
  }),
  TableRow,
  TableHeader,
  TableCell,
  Gapcursor,
  Youtube,
  TextAlign.configure({
    types: ["heading", "paragraph"]
  }),
  CodeBlockLowlight.configure({
    lowlight: createLowlight(common),
    defaultLanguage: "javascript"
  }),
  BubbleMenu.configure({
    element: document.querySelector('.bubble-menu'),
  }),
];

export const useTextEditor = ({ element, placeholder, onChange, value, editable = true, className, ...editorOptions }) => {
  const theme = useTheme();
  const editor = useEditor({
    ...(element ? { element } : {}),
    content: value,
    extensions: [
      Placeholder.configure({
        placeholder,
      }),
      
      ...extensions,
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange === null || onChange === void 0 ? void 0 : onChange(html);
    },
    ...editorOptions,
  });

  useEffect(() => {
    if (!(editor && value))
      return;
    editor.commands.setContent(value);
  }, [editor]);

  useEffect(() => {
    if (editable) {
      editor === null || editor === void 0 ? void 0 : editor.setOptions({
        editable,
        editorProps: {
          attributes: {
            class: className
          },
        },
      });
      return;
    }
    ;
    editor === null || editor === void 0 ? void 0 : editor.setOptions({
      editable: false,
      editorProps: {
        attributes: {
          class: 'mui-tiptap-input mui-tiptap-input-preview'
        },
      },
    });
  }, [editor, editable, theme]);
  return editor;
};
