import { describe, it, expect, beforeEach } from "vitest";
import { useEditorStore } from "@/store/editor.store";

// Reset store before each test
beforeEach(() => {
  useEditorStore.getState().resetEditor();
});

describe("Editor Store", () => {
  describe("Initial state", () => {
    it("should have empty initial state", () => {
      const state = useEditorStore.getState();
      expect(state.present.image).toBeNull();
      expect(state.present.originalFilename).toBeNull();
      expect(state.present.exportFilename).toBeNull();
      expect(state.present.textItems).toHaveLength(0);
      expect(state.present.selectedTextId).toBeNull();
    });

    it("should have empty history", () => {
      const state = useEditorStore.getState();
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });
  });

  describe("setImage", () => {
    it("should set image and filename", () => {
      useEditorStore.getState().setImage("data:image/png;base64,abc", "test.png");

      const state = useEditorStore.getState();
      expect(state.present.image).toBe("data:image/png;base64,abc");
      expect(state.present.originalFilename).toBe("test.png");
      expect(state.present.exportFilename).toBe("test-rv.png");
    });

    it("should clear text items when setting new image", () => {
      useEditorStore.getState().addText("Hello");
      useEditorStore.getState().setImage("data:image/png;base64,abc", "test.png");

      const state = useEditorStore.getState();
      expect(state.present.textItems).toHaveLength(0);
    });

    it("should generate -rv filename correctly", () => {
      useEditorStore.getState().setImage("data:image/png;base64,abc", "photo.jpg");
      expect(useEditorStore.getState().present.exportFilename).toBe("photo-rv.jpg");

      useEditorStore.getState().resetEditor();
      useEditorStore.getState().setImage("data:image/png;base64,abc", "image.webp");
      expect(useEditorStore.getState().present.exportFilename).toBe("image-rv.webp");
    });

    it("should push to history", () => {
      useEditorStore.getState().setImage("data:image/png;base64,abc", "test.png");

      const state = useEditorStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.past[0].image).toBeNull(); // Previous state
    });
  });

  describe("addText", () => {
    it("should add text item with default values", () => {
      useEditorStore.getState().addText("Hello World");

      const state = useEditorStore.getState();
      expect(state.present.textItems).toHaveLength(1);
      expect(state.present.textItems[0].newText).toBe("Hello World");
      expect(state.present.textItems[0].oldText).toBe("");
      expect(state.present.textItems[0].x).toBe(100);
      expect(state.present.textItems[0].y).toBe(100);
      expect(state.present.textItems[0].rotation).toBe(0);
    });

    it("should add text with default text when no argument", () => {
      useEditorStore.getState().addText();

      const state = useEditorStore.getState();
      expect(state.present.textItems[0].newText).toBe("New Text");
    });

    it("should auto-select newly added text", () => {
      useEditorStore.getState().addText("Hello");

      const state = useEditorStore.getState();
      expect(state.present.selectedTextId).toBe(state.present.textItems[0].id);
    });

    it("should stagger position for multiple items", () => {
      useEditorStore.getState().addText("First");
      useEditorStore.getState().addText("Second");
      useEditorStore.getState().addText("Third");

      const items = useEditorStore.getState().present.textItems;
      expect(items[0].x).toBe(100);
      expect(items[0].y).toBe(100);
      expect(items[1].x).toBe(120);
      expect(items[1].y).toBe(120);
      expect(items[2].x).toBe(140);
      expect(items[2].y).toBe(140);
    });

    it("should push to history", () => {
      useEditorStore.getState().addText("Hello");

      const state = useEditorStore.getState();
      expect(state.past).toHaveLength(1);
      expect(state.past[0].textItems).toHaveLength(0);
    });
  });

  describe("updateText", () => {
    it("should update text properties", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().updateText(id, { newText: "Updated", x: 200, y: 300 });

      const item = useEditorStore.getState().present.textItems[0];
      expect(item.newText).toBe("Updated");
      expect(item.x).toBe(200);
      expect(item.y).toBe(300);
    });

    it("should not affect other items", () => {
      useEditorStore.getState().addText("First");
      useEditorStore.getState().addText("Second");
      const id1 = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().updateText(id1, { newText: "Updated First" });

      const items = useEditorStore.getState().present.textItems;
      expect(items[0].newText).toBe("Updated First");
      expect(items[1].newText).toBe("Second");
    });

    it("should push to history", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().updateText(id, { newText: "Updated" });

      const state = useEditorStore.getState();
      expect(state.past).toHaveLength(2); // addText + updateText
    });
  });

  describe("updateTextStyle", () => {
    it("should update style properties", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().updateTextStyle(id, {
        fontSize: 48,
        color: "#FF0000",
        fontWeight: 700,
      });

      const style = useEditorStore.getState().present.textItems[0].style;
      expect(style.fontSize).toBe(48);
      expect(style.color).toBe("#FF0000");
      expect(style.fontWeight).toBe(700);
      // Other defaults should remain
      expect(style.fontFamily).toBe("Inter");
      expect(style.opacity).toBe(1);
    });

    it("should partially update style (merge)", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().updateTextStyle(id, { fontSize: 64 });
      useEditorStore.getState().updateTextStyle(id, { color: "#00FF00" });

      const style = useEditorStore.getState().present.textItems[0].style;
      expect(style.fontSize).toBe(64);
      expect(style.color).toBe("#00FF00");
    });
  });

  describe("deleteText", () => {
    it("should delete text item", () => {
      useEditorStore.getState().addText("Hello");
      useEditorStore.getState().addText("World");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().deleteText(id);

      const state = useEditorStore.getState();
      expect(state.present.textItems).toHaveLength(1);
      expect(state.present.textItems[0].newText).toBe("World");
    });

    it("should clear selection if deleted item was selected", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      // selectedTextId should be the added item
      expect(useEditorStore.getState().present.selectedTextId).toBe(id);

      useEditorStore.getState().deleteText(id);

      expect(useEditorStore.getState().present.selectedTextId).toBeNull();
    });

    it("should keep selection if deleted item was not selected", () => {
      useEditorStore.getState().addText("First");
      useEditorStore.getState().addText("Second");
      const id1 = useEditorStore.getState().present.textItems[0].id;
      const id2 = useEditorStore.getState().present.textItems[1].id;

      // Select second item
      useEditorStore.getState().selectText(id2);
      expect(useEditorStore.getState().present.selectedTextId).toBe(id2);

      // Delete first item
      useEditorStore.getState().deleteText(id1);

      expect(useEditorStore.getState().present.selectedTextId).toBe(id2);
    });
  });

  describe("selectText", () => {
    it("should select a text item", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().selectText(id);

      expect(useEditorStore.getState().present.selectedTextId).toBe(id);
    });

    it("should deselect with null", () => {
      useEditorStore.getState().addText("Hello");
      const id = useEditorStore.getState().present.textItems[0].id;

      useEditorStore.getState().selectText(id);
      useEditorStore.getState().selectText(null);

      expect(useEditorStore.getState().present.selectedTextId).toBeNull();
    });
  });

  describe("undo/redo", () => {
    it("should undo last action", () => {
      useEditorStore.getState().addText("Hello");
      expect(useEditorStore.getState().present.textItems).toHaveLength(1);

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(0);
    });

    it("should redo undone action", () => {
      useEditorStore.getState().addText("Hello");
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(0);

      useEditorStore.getState().redo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(1);
      expect(useEditorStore.getState().present.textItems[0].newText).toBe("Hello");
    });

    it("should handle multiple undo/redo", () => {
      useEditorStore.getState().addText("First");
      useEditorStore.getState().addText("Second");
      useEditorStore.getState().addText("Third");

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(2);

      useEditorStore.getState().undo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(1);

      useEditorStore.getState().redo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(2);

      useEditorStore.getState().redo();
      expect(useEditorStore.getState().present.textItems).toHaveLength(3);
    });

    it("should clear future when new action is performed", () => {
      useEditorStore.getState().addText("First");
      useEditorStore.getState().undo();
      expect(useEditorStore.getState().future).toHaveLength(1);

      useEditorStore.getState().addText("Second");
      expect(useEditorStore.getState().future).toHaveLength(0);
    });

    it("should not undo when no history", () => {
      useEditorStore.getState().undo(); // Should not throw
      expect(useEditorStore.getState().present.textItems).toHaveLength(0);
    });

    it("should not redo when no future", () => {
      useEditorStore.getState().redo(); // Should not throw
      expect(useEditorStore.getState().present.textItems).toHaveLength(0);
    });
  });

  describe("resetEditor", () => {
    it("should reset to initial state", () => {
      useEditorStore.getState().setImage("data:image/png;base64,abc", "test.png");
      useEditorStore.getState().addText("Hello");
      useEditorStore.getState().addText("World");

      useEditorStore.getState().resetEditor();

      const state = useEditorStore.getState();
      expect(state.present.image).toBeNull();
      expect(state.present.textItems).toHaveLength(0);
      expect(state.past).toHaveLength(0);
      expect(state.future).toHaveLength(0);
    });
  });

  describe("revertImage", () => {
    it("should keep image but clear text items", () => {
      useEditorStore.getState().setImage("data:image/png;base64,abc", "test.png");
      useEditorStore.getState().addText("Hello");
      useEditorStore.getState().addText("World");

      useEditorStore.getState().revertImage();

      const state = useEditorStore.getState();
      expect(state.present.image).toBe("data:image/png;base64,abc");
      expect(state.present.originalFilename).toBe("test.png");
      expect(state.present.textItems).toHaveLength(0);
      expect(state.present.selectedTextId).toBeNull();
    });

    it("should push to history", () => {
      useEditorStore.getState().setImage("data:image/png;base64,abc", "test.png");
      useEditorStore.getState().addText("Hello");

      useEditorStore.getState().revertImage();

      const state = useEditorStore.getState();
      expect(state.past).toHaveLength(3); // setImage + addText + revertImage
    });
  });

  describe("Edge cases", () => {
    it("should handle adding empty string text", () => {
      useEditorStore.getState().addText("");

      const items = useEditorStore.getState().present.textItems;
      expect(items).toHaveLength(1);
      expect(items[0].newText).toBe("New Text"); // Default fallback
    });

    it("should handle very long text", () => {
      const longText = "A".repeat(10000);
      useEditorStore.getState().addText(longText);

      expect(useEditorStore.getState().present.textItems[0].newText).toBe(longText);
    });

    it("should handle special characters in text", () => {
      useEditorStore.getState().addText("<script>alert('xss')</script>");
      useEditorStore.getState().addText("Hello & World <3");
      useEditorStore.getState().addText('Text with "quotes" and \'apostrophes\'');

      const items = useEditorStore.getState().present.textItems;
      expect(items).toHaveLength(3);
      expect(items[0].newText).toContain("<script>");
      expect(items[1].newText).toContain("&");
      expect(items[2].newText).toContain('"quotes"');
    });

    it("should generate unique IDs for each text item", () => {
      useEditorStore.getState().addText("First");
      useEditorStore.getState().addText("Second");

      const items = useEditorStore.getState().present.textItems;
      expect(items[0].id).not.toBe(items[1].id);
    });

    it("should deep clone state in history (no reference sharing)", () => {
      useEditorStore.getState().addText("Hello");
      const pastLength = useEditorStore.getState().past.length;

      useEditorStore.getState().addText("World");

      const past = useEditorStore.getState().past;
      expect(past).toHaveLength(pastLength + 1);

      // Modifying present shouldn't affect past
      const pastItem = past[past.length - 1];
      expect(pastItem.textItems).toHaveLength(1);
    });
  });
});
