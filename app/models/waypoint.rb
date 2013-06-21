class Waypoint < ActiveRecord::Base
  def self.first(waypoint)
    if wp = Waypoint.find_by_first(1)
      wp.update_attributes(first: 0)
    end
    waypoint.update_attributes(first: 1)
  end

  def self.last(waypoint)
    if wp = Waypoint.find_by_last(1)
      wp.update_attributes(last: 0)
    end
    waypoint.update_attributes(last: 1)
    puts waypoint.inspect
  end
end
