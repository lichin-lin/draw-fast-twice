"use client";

import { LiveImageShapeUtil } from "@/components/live-image";
import * as fal from "@fal-ai/serverless-client";
import { Editor, FrameShapeTool, TLShapeId, Tldraw, useEditor } from "@tldraw/tldraw";
import { nanoid } from "nanoid";
import { useCallback, useEffect } from "react";
import { LiveImageTool, MakeLiveButton } from "../components/LiveImageTool";

fal.config({
  requestMiddleware: fal.withProxy({
    targetUrl: "/api/fal/proxy",
  }),
});

const shapeUtils = [LiveImageShapeUtil];
const tools = [LiveImageTool];

export default function Home() {
  const _id = `shape:${nanoid()}` as TLShapeId;
  const __id = `shape:${nanoid()}` as TLShapeId;

  const onEditorMount = (editor: Editor) => {

    const pasteImageUrlsToCanvas = async (urls: string[], data?: any) => {
      // get result + apply to canvas
      const blobs = await Promise.all(
        urls.map(async (url: string) => await (await fetch(url)).blob())
      );
      const files = blobs.map(
        (blob) => new File([blob], "tldrawFile", { type: blob.type })
      );
      editor.selectNone();
      editor.mark("paste");
      console.log(data);

      await editor.putExternalContent({
        type: "files",
        files,
        ignoreParent: false,
        ...data,
      });
      urls.forEach((url: string) => URL.revokeObjectURL(url));
    };

    // If there isn't a live image shape, create one
    const liveImage = editor.getCurrentPageShapes().find((shape) => {
      return shape.type === "live-image";
    });

    if (liveImage) {
      const allliveImage = editor.getCurrentPageShapes().filter((shape) => {
        return shape.type === "live-image";
      });
      setInterval(async () => {
        // 1-1. get the image src
        const first = allliveImage[0]
        console.log(first);
        
        const imageElm = document.querySelector(`img[id="${_id}"]`) as HTMLImageElement
        // editor.getCurrentPageShapes.find()
        console.log(first, imageElm.src);
        if (!imageElm.src) {
          return
        }
        const uri = imageElm.src

        // 1-2. create a new image and send to second frame
        await pasteImageUrlsToCanvas([uri], {
          x: 6,
          y: 6,
          props: {
            w: 500,
            h: 500,
          },
        })

        const selectId = editor.getSelectedShapeIds()[0]
        if (selectId) {
          editor.updateShapes([{
            id: selectId,
            type: 'image',
            parentId: __id,
            x: 6,
            y: 6,
            props: {
              w: 500,
              h: 500,
            },
          }])
        }
      }, 5000)
      return;
    }

    // create first
    editor.createShape({
      type: "live-image",
      x: 120,
      y: 180,
      id: _id,
      props: {
        w: 512,
        h: 512,
        name: "a hotdog",
      },
    });

    // create second
    editor.createShape({
      type: "live-image",
      x: 120,
      y: 1200,
      id: __id,
      props: {
        w: 512,
        h: 512,
        name: "a hotdog 4k",
      },
    });
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="fixed inset-0">
        <Tldraw
          persistenceKey="tldraw-fal"
          onMount={onEditorMount}
          shapeUtils={shapeUtils}
          tools={tools}
          shareZone={<MakeLiveButton />}
        />
      </div>
    </main>
  );
}
