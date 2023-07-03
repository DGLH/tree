<script setup lang="ts">
import Tree from './components/Tree/index.vue';

const trees = [
    {
        label: '0-0',
        key: '0-0',
        children: [
            {
                label: '0-0-0',
                key: '0-0-0',
                children: [
                    { label: '0-0-0-0', key: '0-0-0-0' },
                    { label: '0-0-0-1', key: '0-0-0-1' },
                    { label: '0-0-0-2', key: '0-0-0-2' },
                    { label: '0-0-0-3', key: '0-0-0-3' },
                ],
            },
            {
                label: '0-1-0',
                key: '0-1-0',
                children: [{ label: '0-1-0-0', key: '0-1-0-0' }],
            },
        ],
    },
    {
        label: '0-1',
        key: '0-1',
        children: [
            {
                label: '0-1-0',
                key: '0-1-0',
                children: [
                    { label: '0-1-0-0', key: '0-1-0-0' },
                    { label: '0-1-0-1', key: '0-1-0-1' },
                    { label: '0-1-0-2', key: '0-1-0-2' },
                    { label: '0-1-0-3', key: '0-1-0-3' },
                ],
            },
            {
                label: '0-1-1',
                key: '0-1-1',
                children: [{ label: '0-1-1-0', key: '0-1-1-0' }],
            },
        ],
    },
];

const change = (value: string[]) => {
    console.log('🚀 ~ file: App.vue:51 ~ change ~ value:', value);
};
</script>

<template>
    <Tree :node="trees" :change="change" />
</template>

