class CreateWaypointsTable < ActiveRecord::Migration
  def change
    create_table :waypoints do |t|
      t.string :lat
      t.string :lng
      t.string :address
      t.string :description
      t.integer :first
      t.integer :last
    end
  end
end
