import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import TodoList from './TodoList';
import Modal from './ConfirmModal';
import './App.css';

interface List {
  id: string;
  name: string;
  backgroundColor: string;
}

const defaultColors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#00FFFF', '#0000FF', '#800080'];

function ColorPicker({ onColorSelect, isOpen, onClose }: {
  onColorSelect: (color: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="color-picker">
      {defaultColors.map((color) => (
        <button
          key={color}
          className="color-option"
          style={{ backgroundColor: color }}
          onClick={() => {
            onColorSelect(color);
            onClose();
          }}
        />
      ))}
    </div>
  );
}

function DraggableLists({ lists, setLists, onDeleteList }: { 
  lists: List[], 
  setLists: React.Dispatch<React.SetStateAction<List[]>>, 
  onDeleteList: (id: string) => void 
}) {
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, listId: '', listName: '' });
  const [colorPickerState, setColorPickerState] = useState({ isOpen: false, listId: '' });

  const onDragEnd = (result: DropResult) => {
    console.log('Drag ended:', result);
    if (!result.destination) {
      return;
    }

    const newLists = Array.from(lists);
    const [reorderedItem] = newLists.splice(result.source.index, 1);
    newLists.splice(result.destination.index, 0, reorderedItem);

    setLists(newLists);
  };

  const handleDeleteWithConfirmation = (id: string, name: string) => {
    setConfirmModal({ isOpen: true, listId: id, listName: name });
  };

  const handleConfirmDelete = () => {
    onDeleteList(confirmModal.listId);
    setConfirmModal({ isOpen: false, listId: '', listName: '' });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, listId: '', listName: '' });
  };

  const handlePinList = (id: string) => {
    const newLists = Array.from(lists);
    const pinnedListIndex = newLists.findIndex(list => list.id === id);
    if (pinnedListIndex > 0) {
      const [pinnedList] = newLists.splice(pinnedListIndex, 1);
      newLists.unshift(pinnedList);
      setLists(newLists);
    }
  };

  const handleColorSelect = (color: string) => {
    setLists(lists.map(list => 
      list.id === colorPickerState.listId ? { ...list, backgroundColor: color } : list
    ));
  };

  const handleEditListName = (id: string, newName: string) => {
    setLists(lists.map(list => 
      list.id === id ? { ...list, name: newName } : list
    ));
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" direction="horizontal" type="LIST">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="lists-container"
            >
              {lists.map((list, index) => (
                <Draggable key={list.id} draggableId={list.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`list-wrapper ${snapshot.isDragging ? 'dragging' : ''}`}
                      style={{
                        ...provided.draggableProps.style,
                        backgroundColor: list.backgroundColor || 'white',
                      }}
                    >
                      <button
                        className="pin-button"
                        onClick={() => handlePinList(list.id)}
                        title="置顶列表"
                      >
                        📌
                      </button>
                      <TodoList
                        id={list.id}
                        name={list.name}
                        onDelete={() => handleDeleteWithConfirmation(list.id, list.name)}
                        onEditName={(newName) => handleEditListName(list.id, newName)}
                      />
                      <button
                        className="color-picker-button"
                        onClick={() => setColorPickerState({ isOpen: true, listId: list.id })}
                        title="选择背景色"
                      >
                        🎨
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Modal
        isOpen={confirmModal.isOpen}
        message={`确定要删除列表 "${confirmModal.listName}" 吗？此操作不可撤销。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <ColorPicker
        isOpen={colorPickerState.isOpen}
        onColorSelect={handleColorSelect}
        onClose={() => setColorPickerState({ isOpen: false, listId: '' })}
      />
    </>
  );
}

function App() {
  const [lists, setLists] = useState<List[]>(() => {
    const savedLists = localStorage.getItem('todo_lists');
    return savedLists ? JSON.parse(savedLists) : [];
  });
  const [newListName, setNewListName] = useState('');
  const [notification, setNotification] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    localStorage.setItem('todo_lists', JSON.stringify(lists));
  }, [lists]);

  const handleAddList = () => {
    if (newListName.trim() !== '') {
      const newList: List = {
        id: Date.now().toString(),
        name: newListName.trim(),
        backgroundColor: 'white'
      };
      setLists([...lists, newList]);
      setNewListName('');
      setNotification({ isOpen: true, message: `已新增列表 "${newList.name}"` });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddList();
    }
  };

  const handleDeleteList = (id: string) => {
    const newLists = lists.filter(list => list.id !== id);
    setLists(newLists);
    localStorage.removeItem(`todos_${id}`);
  };

  return (
    <div className="App">
      <h1>TODO List</h1>
      <div className="new-list-form">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入新的列表名称"
        />
        <button onClick={handleAddList}>创建新列表</button>
      </div>
      <DraggableLists lists={lists} setLists={setLists} onDeleteList={handleDeleteList} />
      <Modal
        isOpen={notification.isOpen}
        message={notification.message}
        autoClose={true}
        onCancel={() => setNotification({ isOpen: false, message: '' })}
      />
    </div>
  );
}

export default App;
