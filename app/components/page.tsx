"use client"

import React from 'react'
import Link from 'next/link'
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Toggle,
  Badge,
  Tag,
  Chip,
  Avatar,
  Divider,
  Notification,
  Progress,
  Spinner,
  Skeleton,
  SkeletonCard,
  Tooltip,
  Icon,
  Pagination,
  Label
} from '@/lib/components/ui'

export default function ComponentsPage() {
  const [inputValue, setInputValue] = React.useState('')
  const [textareaValue, setTextareaValue] = React.useState('')
  const [selectValue, setSelectValue] = React.useState('')
  const [checkboxValue, setCheckboxValue] = React.useState(false)
  const [radioValue, setRadioValue] = React.useState('')
  const [toggleValue, setToggleValue] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)

  const selectOptions = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
    { value: 'option3', label: '옵션 3' }
  ]

  const radioOptions = [
    { value: 'radio1', label: '라디오 1' },
    { value: 'radio2', label: '라디오 2' },
    { value: 'radio3', label: '라디오 3' }
  ]

  return (
    <div className="min-h-screen bg-primary-bg font-primary">
      {/* 헤더 */}
      <header className="bg-white border-b border-border-light">
        <div className="max-w-container mx-auto px-10 py-6">
          <h1 className="text-4xl font-normal text-primary-text">
            UI 컴포넌트 데모
          </h1>
          <p className="text-lg text-primary-text-secondary mt-2">
            Awwwards 스타일 테마로 구현된 UI 컴포넌트들
          </p>
        </div>
      </header>

      <main className="max-w-container mx-auto px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* 버튼 컴포넌트 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>버튼 (Button)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="accent">Accent</Button>
                  <Button variant="danger">Danger</Button>
                </div>
                <div className="flex gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
                <Button isLoading>로딩 중</Button>
              </div>
            </CardContent>
          </Card>

          {/* 입력 컴포넌트 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>입력 필드 (Input)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="기본 입력"
                  placeholder="텍스트를 입력하세요"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  label="에러 상태"
                  placeholder="에러가 있는 입력"
                  error="이 필드는 필수입니다"
                />
                <Input
                  label="도움말이 있는 입력"
                  placeholder="도움말 예시"
                  helperText="이것은 도움말 텍스트입니다"
                />
              </div>
            </CardContent>
          </Card>

          {/* 텍스트에어리어 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>텍스트 영역 (Textarea)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                label="메시지"
                placeholder="긴 텍스트를 입력하세요"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* 셀렉트 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>선택 상자 (Select)</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="옵션 선택"
                placeholder="옵션을 선택하세요"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
              />
            </CardContent>
          </Card>

          {/* 체크박스 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>체크박스 (Checkbox)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Checkbox
                  label="기본 체크박스"
                  checked={checkboxValue}
                  onChange={setCheckboxValue}
                />
                <Checkbox
                  label="이용약관에 동의합니다"
                  checked={false}
                  onChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* 라디오 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>라디오 버튼 (Radio)</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                name="demo-radio"
                label="옵션을 선택하세요"
                options={radioOptions}
                value={radioValue}
                onChange={setRadioValue}
              />
            </CardContent>
          </Card>

          {/* 토글 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>토글 (Toggle)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Toggle
                  label="알림 받기"
                  description="새로운 업데이트에 대한 알림을 받습니다"
                  checked={toggleValue}
                  onChange={setToggleValue}
                />
                <Toggle
                  label="다크 모드"
                  checked={false}
                  onChange={() => {}}
                />
              </div>
            </CardContent>
          </Card>

          {/* 배지 및 태그 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>배지 & 태그 (Badge & Tag)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="accent">Accent</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                </div>
                <div className="flex gap-2">
                  <Tag variant="default">기본 태그</Tag>
                  <Tag variant="outline">아웃라인</Tag>
                  <Tag variant="filled">채움</Tag>
                  <Tag variant="default" removable onRemove={() => {}}>제거 가능</Tag>
                </div>
                <div className="flex gap-2">
                  <Chip>기본 칩</Chip>
                  <Chip selected>선택된 칩</Chip>
                  <Chip deletable onDelete={() => {}}>삭제 가능</Chip>
                  <Chip icon="settings">아이콘 칩</Chip>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 아바타 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>아바타 (Avatar)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar size="xs" fallback="XS" />
                <Avatar size="sm" fallback="SM" />
                <Avatar size="md" fallback="MD" />
                <Avatar size="lg" fallback="LG" />
                <Avatar size="xl" fallback="홍길동" />
              </div>
            </CardContent>
          </Card>

          {/* 진행률 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>진행률 (Progress)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={30} showLabel label="업로드 진행률" />
                <Progress value={60} variant="accent" />
                <Progress value={85} variant="success" />
              </div>
            </CardContent>
          </Card>

          {/* 스피너 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>스피너 (Spinner)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" color="accent" />
              </div>
            </CardContent>
          </Card>

          {/* 스켈레톤 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>스켈레톤 (Skeleton)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton height={40} />
                <Skeleton width="70%" height={20} />
                <Skeleton variant="circular" width={50} height={50} />
              </div>
            </CardContent>
          </Card>

          {/* 알림 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>알림 (Notification)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Notification type="success" message="성공적으로 저장되었습니다!" />
                <Notification type="error" title="오류 발생" message="처리 중 오류가 발생했습니다." />
                <Notification type="warning" message="주의가 필요한 상황입니다." />
              </div>
            </CardContent>
          </Card>

          {/* 아이콘 */}
          <Card variant="outlined" padding="lg">
            <CardHeader>
              <CardTitle>아이콘 (Icon)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Tooltip content="홈">
                  <Icon name="home" size="lg" />
                </Tooltip>
                <Tooltip content="사용자">
                  <Icon name="user" size="lg" />
                </Tooltip>
                <Tooltip content="설정">
                  <Icon name="settings" size="lg" />
                </Tooltip>
                <Tooltip content="검색">
                  <Icon name="search" size="lg" />
                </Tooltip>
                <Tooltip content="메뉴">
                  <Icon name="menu" size="lg" />
                </Tooltip>
              </div>
            </CardContent>
          </Card>

          {/* 페이지네이션 */}
          <Card variant="outlined" padding="lg" className="lg:col-span-2">
            <CardHeader>
              <CardTitle>페이지네이션 (Pagination)</CardTitle>
            </CardHeader>
            <CardContent>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
                maxVisible={5}
              />
            </CardContent>
          </Card>

        </div>

        <Divider spacing="lg">
          <span className="text-primary-text-secondary">컴포넌트 데모 완료</span>
        </Divider>

        {/* 홈으로 돌아가기 버튼 */}
        <div className="text-center mt-16">
          <Link href="/">
            <Button variant="secondary" size="lg">
              <Icon name="home" size="sm" className="mr-2" />
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </main>

      {/* 데모 페이지로 이동 버튼 (우하단 고정) */}
      <div className="fixed bottom-6 right-6">
        <Link href="/">
          <Button size="sm" className="shadow-lg">
            <Icon name="home" size="xs" className="mr-1" />
            홈
          </Button>
        </Link>
      </div>
    </div>
  )
}