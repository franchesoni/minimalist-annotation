from http.server import SimpleHTTPRequestHandler, HTTPServer

class CustomHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/smalldino.onnx':
            self.send_response(200)
            self.send_header('Content-type', 'application/octet-stream')
            self.send_header('Access-Control-Allow-Origin', '*')  # Allow all origins
            self.end_headers()
            with open('smalldino.onnx', 'rb') as file:
                self.wfile.write(file.read())
        else:
            self.send_response(404)
            self.end_headers()

def run(server_class=HTTPServer, handler_class=CustomHandler, port=8008):
    server_address = ('127.0.0.1', port)
    httpd = server_class(server_address, handler_class)
    print(f'Serving on http://127.0.0.1:{port}/smalldino.onnx')
    httpd.serve_forever()

if __name__ == "__main__":
    run()