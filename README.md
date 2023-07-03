# 树组件的实现 tree

之前面试的时候，面试官让我手写一个树组件，当时也是正好在面试的前半个月，我的工作就是把一个 vue2 写法的树组件用 vue3 重写，我也是刚刚好能够答出来这道题，后面我有一个同事也在面试的时候遇到了这道题，我也就一直记着，现在刚好有时间就来自己实现一下更完整的版本，整篇文章使用 Vue3 + ts 实现，文章使用的 ts 也是非常基础的使用，如果不熟悉 ts 的只需要忽略类型既可。因为树实现的数据也只是一个简单的树结构，所以我将数据放到了最后。

### 基础实现

整个树的基本实现是非常简单的，只要自调用自身既可

```html
<div :style="`margin-left: ${hierarchy.split('&').length * 20}px`">
    {{ node.label }}
</div>

<template v-if="node.children?.length">
    <TreeNode
        v-for="(child, index) in node.children"
        :index="index"
        :node="child"
        :hierarchy="hierarchy + '&' + index"
    />
</template>

...

<script lang="ts">
export default {
    name: 'TreeNode',
};
</script>
```

![1.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e88c105c62ed4a50b4836213623cd2d3~tplv-k3u1fbpfcp-watermark.image?)

上图就是上方代码实现的效果。

整个树的基本实现非常简单，但是需要我们在最后给组件添加 `name` 这样才能在自调用的时候正确引用到自己，`:style="`margin-left: ${hierarchy.split('&').length * 20}px`"` 这条语句是为了让树有层级结构，让树的每一行有一个左边距。

`hierarchy` 该值是标识树的在内部使用的唯一 `key`，每一级都会拼接当前元素的 `index` 来标识当前元素是第几层的第几个元素，如 `hierarchy = '0&1&1'` 就标识当前元素是第三层级下的其父级元素的第二个子元素。

当前只是最基础的树实现，没有其他任何效果，但是如果是面试的话，一般也不会让咱们深入写下去，写到这个样子一般也可以了，当然，这只是我以我面试的结果来看的，我写到这个效果面试官也并没有让我深入写下去。

### 实现动画效果

上面只是最基础的实现，我们给树加一个展开收起的动画效果

```html
<div
    :style="`margin-left: ${hierarchy.split('&').length * 20}px`"
    class="tree_node"
    :class="className"
>
    <span class="triangle_span">
        <img
            v-if="node.children?.length"
            :src="triangle"
            alt="triangle"
            :class="triangleClass"
            @click="handlTriangleClick"
        />
    </span>
    {{ node.label }}
    <template v-if="node.children?.length">
        <div ref="nodes" class="hidden">
            <TreeNode
                v-for="(child, index) in node.children"
                :index="index"
                :node="child"
                :hierarchy="hierarchy + '&' + index"
                :tree="tree"
            />
        </div>
    </template>
</div>

<script>
let isUnfold = true;

//#region 元素的展开收起区域
const triangleClass = ref('triangle');
const childrenClassName = ref(props.className);
const container = ref<Element>();
const nodes = ref();
let triggerFn = null;
onMounted(() => {
    triggerFn = trigger(nodes.value, isUnfold);
});

const handlTriangleClick = () => {
    if (isUnfold) {
        triangleClass.value = 'triangle rotate90';
    } else {
        triangleClass.value = 'triangle';
    }
    triggerFn!(nodes.value, true);
    isUnfold = !isUnfold;
};
</script>
```

> trigger 函数的实现可以参考我的另一篇文章 [不定高度展开收起动画 css/js 实现](https://juejin.cn/post/7249536369474486329)

```css
.tree_node {
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    height: var(--node_height);
}
.triangle_span {
    display: inline-block;
    width: 16px;
    height: 16px;
}
.triangle {
    width: 16px;
    height: 16px;
    transition: all 0.3s;
    cursor: pointer;
}
.triangle.rotate90 {
    transform: rotate(-90deg);
}
```

![2.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/761f35f411844c0599caf1d10faba881~tplv-k3u1fbpfcp-watermark.image?)

上面是给基础的树添加展开收起的动画，现在我们就可以点击三角形进行展开收起动画，动画也是简单的实现，给三角形添加动画，在展开收起的时候将三角形进行选择 90deg 的操作即可，子元素区域我们直接进行展开收起操作即可。

### 添加选中状态

通过以往其他组件的树，我们要实现树元素上选中与部分选中两种样式，我们先给元素的前方加一个选择框，选择框的伪元素 `after` `before` 我们分别用来展示两种状态。

```html
... // 添加在文字的前方三角形的后方既可
<span
    class="check_box_span"
    :class="{ active_select: selected, parter_active: !selected && selectChildren > 0 }"
    @click="select"
/>
{{ node.label }}
...

<style>
.check_box_span {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    border-collapse: separate;
    cursor: pointer;
    position: relative;
    transition: all 0.3s;
}
.check_box_span::after {
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    width: 20%;
    height: 30%;
    content: '';
    transition: all 0.3s;
    opacity: 0;
    border: 2px solid #fff;
    border-color: transparent #fff #fff transparent;
    transform: rotate(45deg) scale(1) translate(55%, -25%);
}
.check_box_span.active_select {
    background-color: #1677ff;
}
.check_box_span.active_select::after {
    opacity: 1;
}
.check_box_span::before {
    position: absolute;
    top: 50%;
    left: 50%;
    content: '';
}
.check_box_span.parter_active::before {
    opacity: 1;
    transform: translate(-50%, -50%);
    border: none;
    width: 50%;
    height: 50%;
    background-color: #1677ff;
}
</style>
```

![3.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3d6ce9cab98489e86c72253d1fa4466~tplv-k3u1fbpfcp-watermark.image?)

不选中时我们不展示这两种状态，选中之后我们给添加 `active` 类，选中使用 `active_select` 类名，部分选中使用 `parter_active` 类名既可。

### 实现树 class

在实现点击选中状态保存之前，我们应该先定义好树结构的保存

```ts
export default class Tree {
    // 选中的结果，结果是传递的 key 值
    selected: string = '';
    // change 事件，在初始化时传递
    change?: (selected: string[]) => void;

    constructor(change?: (selected: string[]) => void) {
        if (change) {
            this.change = change;
        }
    }

    add(select: string) {
        this.selected += '&' + select + '&';
    }

    sub(select: string) {
        this.selected = this.selected.replace('&' + select + '&', '');
    }
    // 触发 change 事件
    triggerChange() {
        if (this.change) {
            this.change(this.getValue());
        }
    }

    reset() {
        this.selected = '';
    }

    getValue() {
        return this.selected.split('&').filter((item) => item);
    }
}
```

`Tree` 类实现也是简单的实现，我们要保存所有选中的状态`add``sub`分别对应添加与删除事件，
`reset` 是重置整个状态，`triggerChange` 是手动触发 `change` 事件时使用，一般在元素状态发生变化的时候最后所有变化完成后触发。

### 传递选中状态

上面我们给树添加了基础的样式与点击事件，但是我们实现树真正复杂的部分对我来说还是元素选中与移除时的状态传递问题。

先来分析一下所有的状态传递：

- 如果是最底层的叶子结点，那么在他被操作时，只需要考虑其自身与其父级元素
  - 如果元素被选中，其父级要观察是否所有子级都被选中，如果都被选中就要变成选中状态，但是如果只是个别元素被选中，就要是部分选中状态
  - 如果元素被移除选中，其父级如果原先是全部选中就要变成部分选中，如果父级元素的其下所有子元素都被移除，就要变成没有任何效果的默认状态
- 如果是中间结点，即有父级也有子级的结点
  - 元素选中时要将其下所有层级的子元素都选中，同时也要跟上面叶子结点一样向上级传递状态
  - 元素移除选中时，要将其下所有子元素都移除，同时也要跟上面叶子结点一样向上级传递状态
- 顶级结点
  - 元素的选中与移除都要传递给其下的子元素，半选状态要依赖其下所有层级的子元素的状态

首先，为了能够知道子元素与父元素的状态变化，我们就有必要给子元素传递一个 `change` 事件，这样，当每一层的子元素发生变化的时候，我们都可以传递给上层的父元素，当然，为了能够确保每一层级都能够正确实现选中与半选的状态，我们需要将一个元素的选中与移除依次向上传递，所以，我们应该在父组件里给子组件传递一个 `change` 事件，并且要将这个 `change` 事件一直向上传递。
我们想在当前元素变化的时候也将当前元素的子元素的状态也跟着变化，所以我们需要父元素控制子元素中的暴露给父元素的方法，所以要给子元素加一个 `ref`，子元素要暴露出来方法给父元素

```html
<TreeNode
    v-for="(child, index) in node.children"
    :index="index"
    :node="child"
    :hierarchy="hierarchy + '&' + index"
    :class-name="childrenClassName"
    :tree="tree"
    ref="nodesRef"
    @change="childChange"
/>

<script>
const childChange = () => {
    console.log('子元素发生变化的时候会在子元素中调用我')
}

// 所有子元素的 ref
const nodesRef = ref(null);
const fatherChange = () => {
    console.log('父元素发生变化的时候会在父元素中调用我')
}
// 暴露给父元素的方法
defineExpose({ fatherChange });

const select = () => {
    console.log('选中或移除选中')
}
</script>
```

父元素与子元素的变化都要依赖于 `select` 方法，所以我们先来实现该方法。
当前元素的变化必定会与上下级元素有交互，所以要在元素变化的时候分别触发 `emit` 和 `ele.fatherChange` 方法，最后我们要在子元素父元素都变化完成后，手动触发 `change` 方法。

```ts
const selected = ref(false);

/**
 * @description: 当前元素的选择操作
 */
const select = () => {
    selected.value = !selected.value;
    // 如果当前元素被选中
    if (selected.value) {
        tree.add(props.node.key);
        // 当前元素选中操作之前，如果已经子元素被选中，那么在子元素被选中的时候已经向当前元素的父元素传递了 0.5，所以在当前元素被选中的时候，只需要在向父元素传递 0.5 既可
        // 即当前元素能够向父元素传递的值最大是 1，如果一个元素被选中那么就要向父元素传递 1，但是如果一个元素只有其下的某几个子元素被选中，但是不是全部子元素，那么当前元素应该只向父元素传递 0.5 既可，即告诉父元素应该展示半选状态
        if (selectChildren.value > 0) {
            emits('change', 0.5);
        } else {
            emits('change', 1);
        }
        // 将子元素也同时选中
        if (nodesRef.value) {
            selectChildren.value = props.node.children!.length;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('select');
            });
        }
        // 元素被移除时，给父级传递 -1 告诉父级移除状态
    } else {
        tree.sub(props.node.key);
        emits('change', -1);

        if (nodesRef.value) {
            selectChildren.value = 0;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('remove');
            });
        }
    }

    // 在树的操作向上向下传递完后，一次性触发树的 change 事件
    tree.triggerChange();
};
```

在上面的代码中，我们使用了 `emits('change', 1);` 向父级传递值，其他的值有 0.5、-1 等，先来讲一讲思路。

在上面 **添加选中状态** 部分，我们将选中状态分为 选中`active_select` 与 半选`parter_active`，其中 `parter_active` 我们使用了 `!selected && selectChildren > 0` 来判断是否，其中 `selected` 是代表当前元素是否被选中，`selectChildren > 0` 代表是否有某个或某几个子元素被选中。

所以上面 `emits('change', 1);` 其中的第二个值，我们用来代表当前元素的子元素被选中的数量，如果子元素传值 0.5 代表子元素下的元素有部分被选中，但不是子元素本身被选中，1 代表某个子元素被选中，-0.5 代表有一个子元素从选中状态变为了移除状态，但是这个子元素的状态变化并不是子元素的本身的点击事件，而是子元素下的某个层级的子元素发生了变化，举个例子如果当前元素是第一层元素，第一层元素选中，其下所有层级元素都选中，但是这时候我们把第三层级的元素移除了选中状态，所以第三层元素就应该给第二层元素传递值 -1，但是第三层又不止这一个元素，所以第二层元素应该给第一层元素传递值 -0.5。

下面我们实现一下 `childChange` 事件

```ts
// 当前选中的子元素的数量，0.5 代表下级的子元素是半选状态，1 代表下级子元素被选中，当前值等于子元素的值就代表子元素全选中
let selectChildren = ref(0);

/**
 * @description: 选中一个元素后，要依层级依次告知父级，如果所有的子元素都被选中，就要给父级传递值 1，如果只是选中了部分子元素，就给自己的父级传递 0.5
 * @param {1 | 0.5 | -1 | -0.5} select 子元素发生变化的时候，传递给父元素一个选中的值，0.5 代表有子元素被选中/取消，但是没有全选/全部取消，1代表有子元素被全选/全部取消
 */
const childChange = (select: 1 | 0.5 | -1 | -0.5) => {
    selectChildren.value += select;
    // 当选中子元素的数量最开始是 0 的时候，认为最开始状态是没有选中子元素
    //  从 0 开始的话，可以直接给父级传递值 1 或 0.5 而不用考虑其他
    if (selectChildren.value - select === 0) {
        // 当选中的子元素数量是当前元素的子元素的数量的时候，要选中当前元素，并且直接向当前元素的父级传递值 1
        if (selectChildren.value === props.node.children!.length) {
            selected.value = true;
            tree.add(props.node.key);
            emits('change', 1);
        } else {
            emits('change', 0.5);
        }
        // 当当前选中子元素的值是当前元素的子元素的数量且初始值不是 0 的时候
    } else if (selectChildren.value === props.node.children!.length) {
        selected.value = true;
        tree.add(props.node.key);
        emits('change', 0.5);
        // 排除上面两种情况，即初始不是 初始没有选中任何子元素 和 选中子元素后当前元素所有子元素都被选中 状态
        // 当前选中/去掉子元素之后不是当前元素的子元素的数量且初始值不是 0 的时候
    } else if (selectChildren.value === 0) {
        if (selected.value) {
            selected.value = false;
            tree.sub(props.node.key);
            emits('change', -1);
        } else {
            emits('change', -0.5);
        }
    } else if (selectChildren.value !== props.node.children!.length) {
        // 如果选中/去掉之前，元素状态是选中的状态，就要勾掉当前元素的选中态，并且告诉当前元素的父元素其选中态被勾掉
        if (selected.value) {
            selected.value = false;
            tree.sub(props.node.key);
            emits('change', -0.5);
        }
    }
};
```

上面我们实现了子元素给父元素传值，父元素进行处理的函数，分别处理各个状态的变化。下面是当前元素变化的时候，对子元素进行的操作

```ts
// 所有的子元素的 ref，是一个数组
const nodesRef = ref<{ fatherChange: (type: 'select' | 'remove') => void }[] | null>(null);

/**
 * @description: 当父元素发生变化的时候，子元素也要跟着全选或者全部取消
 * @param {'select' | 'remove'} type 选择/取消选择
 */
const fatherChange = (type: 'select' | 'remove') => {
    // 当父元素被选择的时候，如果当前元素是已经非选中状态，那么就需要将当前元素选中
    if (type === 'select' && !selected.value) {
        selected.value = true;
        tree.add(props.node.key);
        if (nodesRef.value) {
            selectChildren.value = props.node.children!.length;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('select');
            });
        }
        // 当父元素被移除选择
    } else if (type === 'remove') {
        selected.value = false;
        tree.sub(props.node.key);

        // 如果当前元素还有子元素，就要向子元素传递移除的操作
        if (nodesRef.value) {
            selectChildren.value = 0;
            nodesRef.value.forEach((ele) => {
                ele.fatherChange('remove');
            });
        }
    }
};
```

上面实现了我认为整体树组件实现过程的较难点，我们来看一下效果

![4.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc3b647b6bc742ee867e3cad1108dace~tplv-k3u1fbpfcp-watermark.image?)

> 树结构数据

```js
// 这是整篇文章所使用的树的数据，因为数据并不是很重要，就放到了最后
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
```

#### 最后

这只是我的个人实现方法，可能并不是最好的实现，但是也可能对你有所帮助，欢迎给我提出我的问题，如果发现错误欢迎指出。