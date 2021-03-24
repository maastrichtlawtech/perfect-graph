import { Icon } from '@components/Icon'
import {
  IconButton, Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  ListItemAvatar,
  Checkbox,
  Dialog,
  DialogTitle,
  TextField, Button,
  Card,
} from '@material-ui/core'
import {
  EventHistory,
  OnEventLite,
  Playlist,
} from '@type'
import { EVENT, MOCK_DATA } from '@utils/constants'
import { getUndoEvents } from '@utils'
import {
  View,
  wrapComponent,
} from 'colay-ui'
import { useImmer } from 'colay-ui/hooks/useImmer'
import React from 'react'
import * as R from 'colay/ramda'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import { PlaylistTable } from './PlaylistTable'

export type EventHistoryTableProps = {
  opened?: boolean;
  onEvent: OnEventLite;
  eventHistory: EventHistory;
}

const EventHistoryTableElement = (props: EventHistoryTableProps) => {
  const {
    onEvent,
    eventHistory,
  } = props
  const [state, updateState] = useImmer({
    expanded: false,
    selectedEventIds: [] as string[],
    selectedPlaylistIds: [] as string[],
    playlists: [
      {
        id: R.uuid(),
        name: 'My playlist',
        events: MOCK_DATA.events,
      },
      {
        id: R.uuid(),
        name: 'My playlist2',
        events: MOCK_DATA.events,
      },
    ] as Playlist[],
    createPlaylistDialog: {
      visible: false,
      name: '',
    },
  })
  const hasSelected = state.selectedEventIds.length > 0
  return (
    <View
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
        // paddingRight: 10,
        // paddingLeft: 10,
        height: '100%',
        width: '100%',
      }}
    >
      <Accordion
        expanded={state.expanded}
        onChange={(e, expanded) => updateState((draft) => {
          draft.expanded = expanded
        })}
      >
        <AccordionSummary
          aria-controls="panel1a-content"
        >
          <View
            style={{
              width: '100%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="h6"
                >
                  History
                </Typography>
              </View>
              <View
                style={{
                // alignItems: 'space-between',
                  flexDirection: 'row',
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    onEvent({
                      type: EVENT.UNDO_EVENT,
                      avoidEventRecording: true,
                      avoidHistoryRecording: true,
                    })
                  }}
                >
                  <Icon
                    name="keyboard_arrow_down"
                  />
                </IconButton>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation()
                    onEvent({
                      type: EVENT.REDO_EVENT,
                      avoidEventRecording: true,
                      avoidHistoryRecording: true,
                    })
                  }}
                >
                  <Icon
                    name="keyboard_arrow_up"
                  />
                </IconButton>
              </View>
            </View>
            {
              state.expanded && hasSelected && (
                <Card
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    height: 32,
                    width: '100%',
                  }}
                >
                  <ListItem>
                    <Checkbox
                      checked={!R.isEmpty(state.selectedEventIds)
             && state.selectedEventIds.length === eventHistory.events.length}
                      onChange={(_, checked) => updateState((draft) => {
                        if (checked) {
                          draft.selectedEventIds = eventHistory.events.map((event) => event.id)
                        } else {
                          draft.selectedEventIds = []
                        }
                      })}
                      onClick={(e) => e.stopPropagation()}
                      inputProps={{ 'aria-label': 'primary checkbox' }}
                    />
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation()
                        updateState((draft) => {
                          draft.createPlaylistDialog.name = ''
                          draft.createPlaylistDialog.visible = true
                        })
                      }}
                    >
                      <Icon
                        name="playlist_add"
                      />
                    </IconButton>
                  </ListItem>
                </Card>
              )
            }
          </View>
        </AccordionSummary>
        <AccordionDetails>

          {
          eventHistory.events.length === 0 && (
            <Typography>
              Let's do a few things.
            </Typography>
          )
        }
          <List dense>
            {
          R.reverse(eventHistory.events).map((event, index) => {
            const { length } = eventHistory.events
            return (
              <ListItem
                key={event.id}
                selected={eventHistory.currentIndex === (length - 1) - index}
              >
                <ListItemAvatar>
                  <Checkbox
                    checked={state.selectedEventIds.includes(event.id)}
                    onChange={(_, checked) => updateState((draft) => {
                      if (checked) {
                        draft.selectedEventIds.push(event.id)
                      } else {
                        draft.selectedEventIds = draft.selectedEventIds.filter((id) => id !== event.id)
                      }
                    })}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={event.type}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => onEvent({
                      type: EVENT.APPLY_EVENTS,
                      payload: {
                        events: [{
                          ...eventHistory.undoEvents[index],
                          avoidEventRecording: true,
                          avoidHistoryRecording: true,
                        }],
                      },
                    })}
                  >
                    <Icon name="navigate_before" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => onEvent({
                      type: EVENT.APPLY_EVENTS,
                      payload: {
                        events: [{
                          ...event,
                          avoidEventRecording: true,
                          avoidHistoryRecording: true,
                        }],
                      },
                    })}
                  >
                    <Icon name="navigate_next" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => onEvent({
                      type: EVENT.DELETE_HISTORY_ITEM,
                      payload: {
                        event,
                        avoidEventRecording: true,
                        avoidHistoryRecording: true,
                      },
                    })}
                  >
                    <Icon
                      name="delete_rounded"
                    />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )
          })
        }
          </List>
        </AccordionDetails>
      </Accordion>
      <PlaylistTable
        onSelectAllPlaylist={(checked) => updateState((draft) => {
          if (checked) {
            draft.selectedPlaylistIds = draft.playlists.map((playlist) => playlist.id)
          } else {
            draft.selectedPlaylistIds = []
          }
        })}
        onSelectPlaylist={(playlist, checked) => {
          updateState((draft) => {
            if (checked) {
              draft.selectedPlaylistIds.push(playlist.id)
            } else {
              draft.selectedPlaylistIds = draft.selectedPlaylistIds.filter(
                (id) => id !== playlist.id,
              )
            }
          })
        }}
        playlists={state.playlists}
        selectedPlaylistIds={state.selectedPlaylistIds}
        onPlay={(playlist) => {
          onEvent({
            type: EVENT.PLAY_EVENTS,
            payload: {
              events: playlist.events,
            },
          })
        }}
      />
      <Dialog
        onClose={() => updateState((draft) => {
          draft.createPlaylistDialog.visible = false
        })}
        aria-labelledby="create-playlist-dialog-title"
        open={state.createPlaylistDialog.visible}
      >
        <DialogTitle id="create-playlist-dialog-title">Create Playlist</DialogTitle>
        <View
          style={{
            width: '50%',
            padding: 10,
            justifyContent: 'center',
          }}
        >
          <TextField
            style={{
              marginBottom: 10,
              width: '50vw',
            }}
            fullWidth
            label="name"
            value={state.createPlaylistDialog.name}
            onChange={({ target: { value } }) => updateState((draft) => {
              draft.createPlaylistDialog.name = value
            })}
          />
          <Button
            fullWidth
            onClick={() => updateState((draft) => {
              const playlistEvents = draft.selectedEventIds.map(
                (eventId) => eventHistory.events.find((event) => event.id === eventId)!,
              ).sort((item, other) => (item.date > other.date ? 1 : -1))
              draft.playlists.push({
                id: R.uuid(),
                name: draft.createPlaylistDialog.name,
                events: playlistEvents,
              })
              draft.createPlaylistDialog.visible = false
            })}
          >
            Create
          </Button>
        </View>
      </Dialog>
    </View>
  )
}

export const EventHistoryTable = wrapComponent<EventHistoryTableProps>(EventHistoryTableElement, {})
