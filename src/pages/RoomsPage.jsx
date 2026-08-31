import { useEffect, useState } from "react";
import { createRoom, deleteRoom, fetchAllRooms, updateRoom, ROOM_TYPES } from "../api/roomApi.js";
import StatusMessage from "../components/StatusMessage.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";

const emptyRoomForm = { roomNumber: "", roomType: ROOM_TYPES[0] };

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [newRoomForm, setNewRoomForm] = useState(emptyRoomForm);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState(emptyRoomForm);

  useEffect(() => {
    loadRooms();
  }, []);

  async function loadRooms() {
    setIsLoading(true);
    try {
      const loadedRooms = await fetchAllRooms();
      setRooms(loadedRooms ?? []);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  function updateNewRoomField(fieldName, fieldValue) {
    setNewRoomForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
  }

  function updateEditRoomField(fieldName, fieldValue) {
    setEditRoomForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
  }

  async function handleCreateRoom(submitEvent) {
    submitEvent.preventDefault();
    try {
      const createdRoom = await createRoom(newRoomForm.roomNumber, newRoomForm.roomType);
      setNewRoomForm(emptyRoomForm);
      setFeedback({ type: "success", text: "Created room " + createdRoom.roomNumber + "." });
      await loadRooms();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  function startEditingRoom(room) {
    setEditingRoomId(room.id);
    setEditRoomForm({ roomNumber: room.roomNumber, roomType: room.roomType });
    setFeedback(null);
  }

  function cancelEditingRoom() {
    setEditingRoomId(null);
    setEditRoomForm(emptyRoomForm);
  }

  async function handleSaveRoom(roomId) {
    try {
      await updateRoom(roomId, editRoomForm.roomNumber, editRoomForm.roomType);
      cancelEditingRoom();
      setFeedback({ type: "success", text: "Room updated." });
      await loadRooms();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  async function handleDeleteRoom(room) {
    const isConfirmed = window.confirm("Delete room " + room.roomNumber + "?");
    if (!isConfirmed) {
      return;
    }
    try {
      await deleteRoom(room.id);
      setFeedback({ type: "success", text: "Room deleted." });
      await loadRooms();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  return (
    <section>
      <h2>Rooms</h2>
      <StatusMessage feedback={feedback} onDismiss={() => setFeedback(null)} />

      <form className="card form-row" onSubmit={handleCreateRoom}>
        <label>
          Room number
          <input
            type="text"
            value={newRoomForm.roomNumber}
            onChange={(changeEvent) => updateNewRoomField("roomNumber", changeEvent.target.value)}
            required
          />
        </label>
        <label>
          Room type
          <select
            value={newRoomForm.roomType}
            onChange={(changeEvent) => updateNewRoomField("roomType", changeEvent.target.value)}
          >
            {ROOM_TYPES.map((roomType) => (
              <option key={roomType} value={roomType}>{roomType}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="button-primary">Add room</button>
      </form>

      {isLoading ? (
        <LoadingIndicator label="Loading rooms..." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Room number</th>
              <th>Room type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 && (
              <tr>
                <td colSpan={4} className="empty-cell">No rooms yet.</td>
              </tr>
            )}
            {rooms.map((room) => {
              const isEditing = room.id === editingRoomId;
              return (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editRoomForm.roomNumber}
                        onChange={(changeEvent) =>
                          updateEditRoomField("roomNumber", changeEvent.target.value)
                        }
                      />
                    ) : (
                      room.roomNumber
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <select
                        value={editRoomForm.roomType}
                        onChange={(changeEvent) =>
                          updateEditRoomField("roomType", changeEvent.target.value)
                        }
                      >
                        {ROOM_TYPES.map((roomType) => (
                          <option key={roomType} value={roomType}>{roomType}</option>
                        ))}
                      </select>
                    ) : (
                      room.roomType
                    )}
                  </td>
                  <td className="actions-cell">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="button-primary"
                          onClick={() => handleSaveRoom(room.id)}
                        >
                          Save
                        </button>
                        <button type="button" onClick={cancelEditingRoom}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEditingRoom(room)}>Edit</button>
                        <button
                          type="button"
                          className="button-danger"
                          onClick={() => handleDeleteRoom(room)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
