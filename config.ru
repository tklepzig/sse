# frozen_string_literal: true

require 'sinatra'
require 'json'

class Tasks < Sinatra::Base
  connections = Set.new
  tasks = []

  get '/', provides: 'text/event-stream' do
    headers['Cache-Control'] = 'no-cache'

    stream(:keep_open) do |out|
      if connections.add?(out)
        pp 'Client connected'
        out << "event: blubb\ndata: #{JSON.generate(tasks)}\n\n"

        out.callback do
          pp 'Client disconnected'
          connections.delete(out)
        end
      end

      out << "event: ping\ndata:\n\n"
      sleep 5
    rescue StandardError
      out.close
    end
  end

  get '/add/:task' do
    connections.each do |out|
      tasks << params[:task]
      out << "event: blubb\ndata: #{JSON.generate(tasks)}\n\n"
    rescue StandardError
      out.close
    end
    204
  end
end

app = Rack::Builder.new do
  use Rack::Static, urls: ['/'], root: 'public', index: 'index.html', cascade: true

  map '/events' do
    run Tasks.new
  end
end

puts ''
puts ''
puts '========== Attention =========='
puts 'To exit the server, make sure all consumers (browser tabs) are closed.'
puts ''
puts ''
run app
