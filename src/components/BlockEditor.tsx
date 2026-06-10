import React, { useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useThemeStore } from "../store/useThemeStore";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface BlockEditorProps {
  noteId: string;
  initialContent: string;
  onChange: (content: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  noteId,
  initialContent,
  onChange,
}) => {
  const theme = useThemeStore((s) => s.theme);
  
  // Create blocknote editor instance
  const editor = useCreateBlockNote();
  
  // Keep track of the current note ID to check if it changed
  const lastNoteIdRef = useRef<string | null>(null);
  
  // Lock update trigger during programmatic block changes
  const isSyncingRef = useRef(false);

  // Sync content when noteId changes
  useEffect(() => {
    async function loadMarkdownContent() {
      // Avoid loading if the noteId is the same (to prevent cursor jumping)
      if (lastNoteIdRef.current === noteId) return;
      
      lastNoteIdRef.current = noteId;
      isSyncingRef.current = true;
      
      try {
        const blocks = await editor.tryParseMarkdownToBlocks(initialContent || "");
        editor.replaceBlocks(editor.document, blocks);
      } catch (err) {
        console.error("[BlockEditor] failed parsing markdown to blocks:", err);
      } finally {
        isSyncingRef.current = false;
      }
    }

    loadMarkdownContent();
  }, [noteId, initialContent, editor]);

  // Handle document edits and notify parent
  const handleEditorChange = async () => {
    if (isSyncingRef.current) return;
    
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      onChange(markdown);
    } catch (err) {
      console.error("[BlockEditor] failed to serialize blocks to markdown:", err);
    }
  };

  return (
    <div className="w-full h-full text-text overflow-y-auto">
      <BlockNoteView
        editor={editor}
        theme={theme}
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default BlockEditor;
