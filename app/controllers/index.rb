get '/about' do
  erb :about
end

get '/' do
  erb :index
end

post '/waypoints/save' do
  Waypoint.create(
    lat: params[:lat],
    lng: params[:lng],
    address: params[:address],
    first: 0, 
    last: 0 )
end

post '/reset_waypoints' do
  Waypoint.destroy_all
  return true
end

get '/waypoints/all' do
  erb :_all_waypoints, layout: false, locals: { waypoints: Waypoint.all }
end

post '/waypoints/set_first_waypoint' do
  Waypoint.find_by_address(params[:address]).update_attributes(first: 1)
end

post '/waypoints/set_last_waypoint' do
  Waypoint.find_by_address(params[:address]).update_attributes(last: 1)
end

get '/waypoints/order' do
  content_type :json
  { 
    first: Waypoint.find_by_first(1),
    waypoints: Waypoint.where(first: 0, last: 0),
    last: Waypoint.find_by_last(1)
  }.to_json
end
