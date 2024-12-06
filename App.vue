<template>
    <div class="size-full flex items-stretch [&>div]:p-4 tracking-wide">
        <div class="w-[400px] shrink-0 flex flex-col gap-2 overflow-auto">
            <Loop v-if="tree.length" :model-value="tree" default-expand-all>
                <template #default="{ item, layer }">
                    <div
                        @click="handleClickSideItem(item.data)"
                        class="[&>div]:shrink-0 flex items-center gap-2 relative p-[2px] clickable rounded"
                        :style="{
                            ...(item.dir
                                ? {
                                      opacity: 0.5,
                                  }
                                : {}),
                            color:
                                item.type === 'del'
                                    ? '#FF4D36'
                                    : item.type === 'add'
                                    ? '#0CCA32'
                                    : '',
                        }"
                    >
                        <div
                            :style="{
                                width: `${layer * 24}px`,
                            }"
                        ></div>
                        <div
                            v-for="(_, i) in new Array(layer).fill(0)"
                            :key="i"
                            class="absolute top-0 text-[#ddd]"
                            :style="{ left: `${i * 24 + 12}px` }"
                        >
                            |
                        </div>
                        <FolderOutlined v-if="item.dir"></FolderOutlined>
                        <FileFilled v-else></FileFilled>
                        <div>
                            {{ item.name }}
                        </div>
                    </div>
                </template>
            </Loop>
        </div>
        <div ref="scrollContainerRef" class="space-y-12 overflow-auto relative">
            <div v-for="(diff, i) in diffs" :key="i">
                <div
                    :data-file-path="diff.deleted ? diff.from : diff.to"
                    class="sticky top-0 shadow-xl inline-flex items-center gap-2 bg-[#efefef] text-lg px-2 py-1 rounded"
                >
                    <!-- <div>from : {{ diff.from }}</div> -->
                    <span
                        v-for="(d, i) in (diff.deleted
                            ? diff.from
                            : diff.to
                        ).split('/')"
                        :key="i"
                        :class="
                            i ===
                            (diff.deleted ? diff.from : diff.to).split('/')
                                .length -
                                1
                                ? 'font-bold'
                                : ''
                        "
                    >
                        <span v-if="i !== 0">/</span>
                        {{ d }}
                    </span>
                </div>
                <div
                    v-for="(chunk, j) in diff.chunks"
                    :key="j"
                    class="bg-[#fafafa] leading-[2] rounded [&>div]:px-4 overflow-hidden"
                >
                    <pre
                        v-for="(change, k) in chunk.changes"
                        :key="k"
                        :class="[
                            'px-4 whitespace-pre-wrap break-all',
                            change.add ? 'text-[#333] bg-[#EBF6F1]' : '',
                            change.del ? 'text-[#FF4D36] bg-[#FFF6F4]' : '',
                        ]">{{ change.content.slice(0, 1024) }} <span v-if="change.content.length > 1024" class="bg-black text-white">[{{ change.content.length }} chars]...</span></pre>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import Loop from './Loop.vue'
import { FolderOutlined, FileFilled } from '@ant-design/icons-vue'

interface Change {
    type: 'normal' | 'del' | 'add'
    content: string
    newLine: number
    oldLine: number
    position: number
    normal?: boolean
    del?: boolean
    add?: boolean
}
interface Chunk {
    changes: Change[]
    content: string
    newLines: number
    newStart: number
    oleLines: number
    oldStart: number
}

interface Diff {
    deleted?: boolean
    new?: boolean
    additions: number
    chunks: Chunk[]
    deletions: number
    from: string
    index: string[]
    to: string
}
interface Node {
    id: string
    name: string
    dir: boolean
    type: 'add' | 'del' | 'normal'
    data: Diff
    children: Node[]
}
function randomId() {
    return `id${Math.random()}`
}
function buildTree(datas: Diff[]) {
    const trees: Node[] = []
    datas.forEach((d) => {
        const path = d.deleted ? d.from : d.to
        const paths = path.indexOf('/') !== -1 ? path.split('/') : [path]
        const dirPaths = paths.slice(0, -1)
        let t: Node | undefined
        const type = d.deleted
            ? 'del'
            : d.new
            ? 'add'
            : ('normal' satisfies Node['type'])
        for (const p of dirPaths) {
            let nextT = (t ? t.children : trees).find((t) => t.name === p)
            if (!nextT) {
                nextT = {
                    data: d,
                    id: randomId(),
                    name: p,
                    dir: true,
                    type,
                    children: [],
                }
                if (t) {
                    t.children.push(nextT)
                } else {
                    trees.push(nextT)
                }
            }
            t = nextT
        }
        if (dirPaths.length === 0) {
            // root
            trees.push({
                data: d,
                id: randomId(),
                name: path,
                children: [],
                dir: false,
                type,
            })
        }
        t?.children.push({
            data: d,
            type,
            id: randomId(),
            name: paths.slice(-1)[0],
            dir: false,
            children: [],
        })
    })
    return trees
}

const diffs = ref<Diff[]>([])
const tree = ref<Node[]>([])
axios.get('./diff.json').then((res) => {
    diffs.value = res.data
    tree.value = buildTree(res.data)
    console.debug('diffs: ', res.data, buildTree(res.data))
})
const scrollContainerRef = ref<HTMLDivElement>()
function handleClickSideItem(item: Diff) {
    document
        .querySelector(
            '[data-file-path="' + (item.deleted ? item.from : item.to) + '"]'
        )
        ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })
}
</script>

<style lang="css">
body {
    font: 14px / 1 Consolas, monospace, Mono 'Helvetica Neue', Helvetica, Arial,
        'Microsoft Yahei', 'Hiragino Sans GB', 'Heiti SC', 'WenQuanYi Micro Hei',
        sans-serif;
}
.clickable {
    cursor: pointer;
    transition-duration: 0.3s;
    &:hover {
        background: #efefef;
    }
}
</style>
