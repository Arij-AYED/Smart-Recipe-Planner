
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MealPlannerCalendar = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
  
  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, string | null>>>({
    Monday: { Breakfast: 'Berry Protein Smoothie', Lunch: null, Dinner: 'Grilled Salmon with Quinoa' },
    Tuesday: { Breakfast: 'Avocado Toast Supreme', Lunch: 'Mediterranean Chickpea Bowl', Dinner: null },
    Wednesday: { Breakfast: null, Lunch: null, Dinner: 'Chicken Stir Fry' },
    Thursday: { Breakfast: null, Lunch: null, Dinner: null },
    Friday: { Breakfast: null, Lunch: null, Dinner: 'Lentil Curry' },
    Saturday: { Breakfast: null, Lunch: null, Dinner: null },
    Sunday: { Breakfast: null, Lunch: null, Dinner: null }
  });

  const getWeekDates = () => {
    const startOfWeek = new Date(currentWeek);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    return days.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'Breakfast':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'Lunch':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'Dinner':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const totalPlannedMeals = Object.values(mealPlan).reduce((total, day) => {
    return total + Object.values(day).filter(meal => meal !== null).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="bg-gradient-to-r from-orange-500 to-green-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h3>
              <p className="opacity-90">
                {totalPlannedMeals} meals planned • {21 - totalPlannedMeals} meals to plan
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => navigateWeek('prev')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => navigateWeek('next')}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button className="bg-white text-orange-600 hover:bg-gray-50">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Generate Shopping List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {days.map((day, dayIndex) => (
          <Card key={day} className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader className="pb-3">
              <div className="text-center">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {day}
                </CardTitle>
                <p className="text-sm text-gray-500">
                  {weekDates[dayIndex].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mealTypes.map((mealType) => (
                <div key={mealType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{mealType}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-6 h-6 p-0 hover:bg-orange-100"
                      onClick={() => console.log(`Add ${mealType} for ${day}`)}
                    >
                      <Plus className="w-3 h-3 text-gray-400" />
                    </Button>
                  </div>
                  
                  {mealPlan[day][mealType] ? (
                    <div className={`p-3 rounded-lg border-2 ${getMealColor(mealType)} cursor-pointer hover:shadow-md transition-shadow`}>
                      <p className="text-sm font-medium">
                        {mealPlan[day][mealType]}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border-2 border-dashed border-gray-300 text-center cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors">
                      <p className="text-xs text-gray-400">Add meal</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{totalPlannedMeals}</div>
            <div className="text-sm text-gray-600">Meals Planned</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-sm text-gray-600">Unique Recipes</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">~1,750</div>
            <div className="text-sm text-gray-600">Avg Daily Calories</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MealPlannerCalendar;
