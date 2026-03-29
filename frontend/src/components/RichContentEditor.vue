<script setup>
import { watch, onBeforeUnmount } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Image as TiptapImage } from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Extension } from "@tiptap/core";
import { uploadContentImage } from "../api/products.js";
import { useToastStore } from "../stores/toast.js";

const props = defineProps({
  modelValue: { type: String, default: "" },
  productId: { type: [Number, String], required: true },
  placeholder: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);
const toastStore = useToastStore();

// FontSize extension built on TextStyle
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];

async function handleImageUpload(file) {
  try {
    const res = await uploadContentImage(props.productId, file);
    const url = res?.data?.url;
    if (url) {
      editor.value.chain().focus().setImage({ src: url }).run();
    }
  } catch {
    toastStore.add("圖片上傳失敗，請稍後再試", "error");
  }
}

const editor = useEditor({
  extensions: [
    StarterKit,
    TextStyle,
    Color,
    FontSize,
    Underline,
    TiptapImage.configure({ inline: false }),
  ],
  content: props.modelValue,
  onUpdate({ editor: ed }) {
    emit("update:modelValue", ed.getHTML());
  },
  editorProps: {
    handleDrop(view, event) {
      const files = event.dataTransfer?.files;
      if (files?.length) {
        for (const file of files) {
          if (file.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(file);
          }
        }
        return true;
      }
      return false;
    },
    handlePaste(view, event) {
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            handleImageUpload(item.getAsFile());
            return true;
          }
        }
      }
      return false;
    },
  },
});

watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && editor.value.getHTML() !== val) {
      editor.value.commands.setContent(val || "", false);
    }
  }
);

onBeforeUnmount(() => editor.value?.destroy());

function triggerImageUpload() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png";
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };
  input.click();
}

function setFontSize(size) {
  if (size) {
    editor.value.chain().focus().setFontSize(size).run();
  } else {
    editor.value.chain().focus().unsetFontSize().run();
  }
}

function setColor(e) {
  editor.value.chain().focus().setColor(e.target.value).run();
}

function getCurrentFontSize() {
  return editor.value?.getAttributes("textStyle")?.fontSize || "";
}
</script>

<template>
  <div class="rich-editor">
    <div class="rich-editor__toolbar">
      <!-- Font size -->
      <select
        class="toolbar-select"
        :value="getCurrentFontSize()"
        @change="setFontSize($event.target.value)"
        title="字體大小"
      >
        <option value="">預設</option>
        <option v-for="s in FONT_SIZES" :key="s" :value="s">{{ s }}</option>
      </select>

      <!-- Color -->
      <label class="toolbar-color" title="字體顏色">
        <span class="toolbar-color__icon">A</span>
        <input type="color" @input="setColor" />
      </label>

      <!-- Bold -->
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor?.isActive('bold') }"
        title="粗體"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <strong>B</strong>
      </button>

      <!-- Italic -->
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor?.isActive('italic') }"
        title="斜體"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <em>I</em>
      </button>

      <!-- Underline -->
      <button
        type="button"
        class="toolbar-btn"
        :class="{ 'toolbar-btn--active': editor?.isActive('underline') }"
        title="底線"
        @click="editor?.chain().focus().toggleUnderline().run()"
      >
        <u>U</u>
      </button>

      <!-- Insert image -->
      <button
        type="button"
        class="toolbar-btn"
        title="插入圖片"
        @click="triggerImageUpload"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </button>
    </div>

    <EditorContent
      :editor="editor"
      class="rich-editor__content"
      :data-placeholder="placeholder"
    />
  </div>
</template>

<style scoped>
.rich-editor {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  overflow: hidden;
}

.rich-editor__toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.toolbar-select {
  height: 28px;
  padding: 0 0.375rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm, 4px);
  font-size: var(--font-size-xs);
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm, 4px);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.toolbar-btn:hover {
  background: var(--color-border);
}

.toolbar-btn--active {
  background: var(--color-cta);
  color: #fff;
  border-color: var(--color-cta);
}

.toolbar-color {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  cursor: pointer;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm, 4px);
  font-weight: 700;
  font-size: var(--font-size-sm);
}

.toolbar-color input[type="color"] {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.toolbar-color__icon {
  pointer-events: none;
}

.rich-editor__content {
  min-height: 180px;
  padding: 0.75rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: 1.6;
  cursor: text;
}

/* ProseMirror editor reset */
.rich-editor__content :deep(.ProseMirror) {
  outline: none;
  min-height: 160px;
}

.rich-editor__content :deep(.ProseMirror p) {
  margin: 0 0 0.75em;
}

.rich-editor__content :deep(.ProseMirror p:last-child) {
  margin-bottom: 0;
}

.rich-editor__content :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-base);
}

/* Placeholder */
.rich-editor__content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--color-text-secondary);
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
