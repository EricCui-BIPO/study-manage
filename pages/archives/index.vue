<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-vue-next'
import type { Archive, ArchiveForm, Student } from '~/types'

definePageMeta({
  middleware: 'auth',
})

const { user } = useAuth()
const { archives, loading, fetchArchives, createArchive, updateArchive, deleteArchive } = useArchives()
const { fetchStudents } = useStudents()

const filterType = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(1)
const totalCount = ref(0)

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const viewDialogOpen = ref(false)
const editingArchive = ref<Archive | null>(null)
const deletingArchive = ref<Archive | null>(null)
const viewingArchive = ref<Archive | null>(null)
const formLoading = ref(false)

const allStudents = ref<Student[]>([])

const defaultForm: ArchiveForm = {
  student_id: '',
  title: '',
  content: '',
  type: 'note',
  date: '',
}

const form = ref<ArchiveForm>({ ...defaultForm })

const typeMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  reward: { label: '奖励', variant: 'default' },
  punishment: { label: '处分', variant: 'destructive' },
  activity: { label: '活动', variant: 'secondary' },
  note: { label: '备注', variant: 'outline' },
}

const loadArchives = async () => {
  const result = await fetchArchives(currentPage.value, pageSize.value, undefined, filterType.value || undefined)
  totalPages.value = result.pagination.totalPages
  totalCount.value = result.pagination.total
}

const loadStudents = async () => {
  const result = await fetchStudents(1, 1000)
  allStudents.value = result.data
}

const handleSearch = () => {
  currentPage.value = 1
  loadArchives()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadArchives()
}

const openCreateDialog = () => {
  editingArchive.value = null
  form.value = { ...defaultForm }
  dialogOpen.value = true
}

const openEditDialog = (archive: Archive) => {
  editingArchive.value = archive
  form.value = {
    student_id: archive.student_id,
    title: archive.title,
    content: archive.content,
    type: archive.type,
    date: archive.date,
  }
  dialogOpen.value = true
}

const openViewDialog = (archive: Archive) => {
  viewingArchive.value = archive
  viewDialogOpen.value = true
}

const openDeleteDialog = (archive: Archive) => {
  deletingArchive.value = archive
  deleteDialogOpen.value = true
}

const handleSubmit = async () => {
  formLoading.value = true
  try {
    if (editingArchive.value) {
      await updateArchive(editingArchive.value.id, form.value)
    } else {
      await createArchive({
        ...form.value,
        created_by: user.value?.id || '',
      })
    }
    dialogOpen.value = false
    loadArchives()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async () => {
  if (!deletingArchive.value) return
  formLoading.value = true
  try {
    await deleteArchive(deletingArchive.value.id)
    deleteDialogOpen.value = false
    loadArchives()
  } catch (error) {
    console.error('删除失败:', error)
  } finally {
    formLoading.value = false
  }
}

const getStudentName = (archive: any) => {
  return archive.students?.name || '未知'
}

const getStudentId = (archive: any) => {
  return archive.students?.student_id || '-'
}

onMounted(() => {
  loadArchives()
  loadStudents()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">学生档案</h1>
        <p class="mt-1 text-sm text-gray-500">管理学生档案记录</p>
      </div>
      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4 mr-2" />
        添加档案
      </Button>
    </div>

    <Card>
      <CardHeader>
        <div class="flex items-center space-x-4">
          <Select v-model="filterType">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="筛选类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              <SelectItem value="reward">奖励</SelectItem>
              <SelectItem value="punishment">处分</SelectItem>
              <SelectItem value="activity">活动</SelectItem>
              <SelectItem value="note">备注</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" @click="handleSearch">筛选</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学号</TableHead>
              <TableHead>学生姓名</TableHead>
              <TableHead>标题</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>日期</TableHead>
              <TableHead class="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="loading">
              <TableCell colspan="6" class="text-center py-8 text-gray-500">
                加载中...
              </TableCell>
            </TableRow>
            <TableRow v-else-if="archives.length === 0">
              <TableCell colspan="6" class="text-center py-8 text-gray-500">
                暂无数据
              </TableCell>
            </TableRow>
            <TableRow v-for="archive in archives" :key="archive.id">
              <TableCell class="font-medium">{{ getStudentId(archive) }}</TableCell>
              <TableCell>{{ getStudentName(archive) }}</TableCell>
              <TableCell>{{ archive.title }}</TableCell>
              <TableCell>
                <Badge :variant="typeMap[archive.type]?.variant">
                  {{ typeMap[archive.type]?.label }}
                </Badge>
              </TableCell>
              <TableCell>{{ archive.date }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end space-x-2">
                  <Button variant="ghost" size="icon" @click="openViewDialog(archive)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="openEditDialog(archive)">
                    <Pencil class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" @click="openDeleteDialog(archive)">
                    <Trash2 class="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-4">
          <div class="text-sm text-gray-500">
            共 {{ totalCount }} 条记录
          </div>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage <= 1"
              @click="handlePageChange(currentPage - 1)"
            >
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <span class="text-sm">
              第 {{ currentPage }} / {{ totalPages }} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              :disabled="currentPage >= totalPages"
              @click="handlePageChange(currentPage + 1)"
            >
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editingArchive ? '编辑档案' : '添加档案' }}</DialogTitle>
          <DialogDescription>
            {{ editingArchive ? '修改档案信息' : '填写档案信息' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="student_id">学生</Label>
            <Select v-model="form.student_id">
              <SelectTrigger>
                <SelectValue placeholder="选择学生" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="student in allStudents"
                  :key="student.id"
                  :value="student.id"
                >
                  {{ student.name }} ({{ student.student_id }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="title">标题</Label>
              <Input id="title" v-model="form.title" required />
            </div>
            <div class="space-y-2">
              <Label for="type">类型</Label>
              <Select v-model="form.type">
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reward">奖励</SelectItem>
                  <SelectItem value="punishment">处分</SelectItem>
                  <SelectItem value="activity">活动</SelectItem>
                  <SelectItem value="note">备注</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="space-y-2">
            <Label for="date">日期</Label>
            <Input id="date" v-model="form.date" type="date" required />
          </div>
          <div class="space-y-2">
            <Label for="content">内容</Label>
            <textarea
              id="content"
              v-model="form.content"
              required
              rows="4"
              class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="dialogOpen = false">
              取消
            </Button>
            <Button type="submit" :disabled="formLoading">
              {{ formLoading ? '保存中...' : '保存' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- View Dialog -->
    <Dialog v-model:open="viewDialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>档案详情</DialogTitle>
        </DialogHeader>
        <div v-if="viewingArchive" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-gray-500">学生</Label>
              <p class="mt-1">{{ getStudentName(viewingArchive) }} ({{ getStudentId(viewingArchive) }})</p>
            </div>
            <div>
              <Label class="text-gray-500">类型</Label>
              <p class="mt-1">
                <Badge :variant="typeMap[viewingArchive.type]?.variant">
                  {{ typeMap[viewingArchive.type]?.label }}
                </Badge>
              </p>
            </div>
            <div>
              <Label class="text-gray-500">标题</Label>
              <p class="mt-1">{{ viewingArchive.title }}</p>
            </div>
            <div>
              <Label class="text-gray-500">日期</Label>
              <p class="mt-1">{{ viewingArchive.date }}</p>
            </div>
          </div>
          <div>
            <Label class="text-gray-500">内容</Label>
            <p class="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{{ viewingArchive.content }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="viewDialogOpen = false">
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Dialog -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            确定要删除这条档案记录吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteDialogOpen = false">
            取消
          </Button>
          <Button variant="destructive" :disabled="formLoading" @click="handleDelete">
            {{ formLoading ? '删除中...' : '确认删除' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
