<template>
    <div class="size-full flex items-stretch [&>div]:p-4 tracking-wide">
        <div class="w-[320px] shrink-0 flex flex-col gap-2 overflow-auto">
            <div
                v-for="(diff, ind) in diffs"
                :key="ind"
                class="rounded p-1 px-3 [&>div]:break-all"
                :style="{
                    background: diff.deleted
                        ? '#FFF6F4'
                        : diff.new
                        ? '#EBF6F1'
                        : '#F0F0F0',
                    color: diff.deleted ? '#FF4D36' : diff.new ? '#0CCA32' : '',
                }"
            >
                <template v-if="!diff.deleted">
                    <div v-if="diff.new">+</div>
                    <div>
                        {{ diff.to.slice(diff.to.lastIndexOf('/') + 1) }}
                    </div>
                    <div class="text-sm text-[#666]">
                        {{ diff.to }}
                    </div>
                </template>
                <template v-else>
                    <div>-</div>
                    <div>
                        {{ diff.from.slice(diff.from.lastIndexOf('/') + 1) }}
                    </div>
                    <div class="text-sm text-[#666]">
                        {{ diff.from }}
                    </div>
                </template>
            </div>
        </div>
        <div class="space-y-12 overflow-auto">
            <div v-for="(diff, i) in diffs" :key="i" class="space-y-4">
                <div class="flex items-center gap-4 text-[#666]">
                    <!-- <div>from : {{ diff.from }}</div> -->
                    <div>{{ diff.deleted ? diff.from : diff.to }}</div>
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
                            'px-4',
                            change.add ? 'text-[#333] bg-[#EBF6F1]' : '',
                            change.del ? 'text-[#FF4D36] bg-[#FFF6F4]' : '',
                        ]"
                        >{{ change.content }}</pre
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'

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
const diffs = ref<Diff[]>([])
axios.get('./diff.json').then((res) => {
    diffs.value = res.data
    console.debug('diffs: ', res.data)
})
</script>

<style lang="css">
body {
    font: 14px / 1 'Helvetica Neue', Helvetica, Arial, 'Microsoft Yahei',
        'Hiragino Sans GB', 'Heiti SC', 'WenQuanYi Micro Hei', sans-serif;
}
</style>
