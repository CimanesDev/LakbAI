import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import type { ItineraryDay } from '@/integrations/gemini/client';

interface ActivityEditorProps {
  dayData: ItineraryDay;
  onUpdate: (updatedDay: ItineraryDay) => void;
  alternatives: Array<{
    time: string;
    activity: string;
    location: string;
    description: string;
    estimated_cost?: number;
  }>;
}

export const ActivityEditor: React.FC<ActivityEditorProps> = ({
  dayData,
  onUpdate,
  alternatives,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(dayData.activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onUpdate({
      ...dayData,
      activities: items,
    });
  };

  const handleReplaceActivity = (index: number, alternative: typeof alternatives[0]) => {
    const updatedActivities = [...dayData.activities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      activity: alternative.activity,
      description: alternative.description,
      estimated_cost: alternative.estimated_cost,
    };

    onUpdate({
      ...dayData,
      activities: updatedActivities,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#0032A0]">Edit Activities</h3>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="text-[#0032A0] border-[#0032A0] hover:bg-[#0032A0]/10"
        >
          {isEditing ? 'Done Editing' : 'Edit Activities'}
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="activities">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {dayData.activities.map((activity, index) => (
                <Draggable
                  key={index}
                  draggableId={`activity-${index}`}
                  index={index}
                  isDragDisabled={!isEditing}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card className="bg-white border border-gray-200 shadow-lg">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-24 text-center">
                              <div className="text-lg font-semibold text-[#0032A0]">
                                {activity.time}
                              </div>
                              {activity.estimated_cost && (
                                <div className="text-sm text-[#BF0D3E]">
                                  ₱{activity.estimated_cost}
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {activity.activity}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 text-[#0032A0]" />
                                {activity.location}
                              </div>
                              <p className="text-gray-600">
                                {activity.description}
                              </p>

                              {isEditing && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <h4 className="text-sm font-semibold text-[#0032A0] mb-2">
                                    Alternative Activities
                                  </h4>
                                  <div className="space-y-2">
                                    {alternatives.map((alt, i) => (
                                      <Button
                                        key={i}
                                        variant="outline"
                                        className="w-full justify-start text-left text-sm"
                                        onClick={() => handleReplaceActivity(index, alt)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4 text-[#0032A0]" />
                                          <span>{alt.time}</span>
                                          <span className="font-medium">{alt.activity}</span>
                                          {alt.estimated_cost && (
                                            <span className="text-[#BF0D3E] ml-auto">
                                              ₱{alt.estimated_cost}
                                            </span>
                                          )}
                                        </div>
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 